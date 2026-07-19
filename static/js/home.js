/* Weijue Bu — homepage interactions
   1. Background canvas: line-art robot arm running a pick-and-place cycle
      (keyframed FK poses: grasp a cube at PICK, carry it to the PLACE
      reticle, release; animated gripper, dashed trajectory hints, contact
      pulse rings) + LiDAR perception scene (rotating sweep ray with fading
      arc trail, flaring floor point-cloud, concentric range rings)
   2. Hero typewriter (#typer, phrases from data-phrases JSON)
   3. Metric counters (.metric-num[data-count], animated on scroll into view)
   4. Scroll reveal (.reveal)
   5. Click-to-copy chips ([data-copy]) + toast (#toast)
   6. Pointer tilt on publication cards ([data-tilt], fine pointers only)
   7. prefers-reduced-motion: blank canvas, static typewriter text, instant
      counters, no tilt, no video autoplay
*/
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TAU = Math.PI * 2;

    /* ---------- 1. Robot-arm pick-and-place + LiDAR perception canvas ---------- */
    var canvas = document.getElementById('bg-canvas');
    if (canvas && !reduceMotion) {
        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W = 0, H = 0, raf = null;
        var TILT = 0.32;
        var t0 = Math.random() * 100;

        function resize() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            updateFade();
        }

        /* forward kinematics from an explicit joint pose {th0..th3};
           returns the link points plus the wrist frame (d3 = tool direction,
           lat = lateral axis) so the gripper can be articulated at draw time */
        function fk(th0, th1, th2, th3) {
            var L1 = 0.66, L2 = 0.92, L3 = 0.80, L4 = 0.30;
            var cy = Math.cos(th0), sy = Math.sin(th0);
            function dir(a) { return [Math.cos(a) * cy, Math.sin(a), Math.cos(a) * sy]; }
            function add(p, d, L) { return [p[0] + d[0] * L, p[1] + d[1] * L, p[2] + d[2] * L]; }
            var p0 = [0, 0, 0];
            var p1 = [0, L1, 0];
            var a1 = th1, a2 = th1 + th2, a3 = a2 + th3;
            var d1 = dir(a1), p2 = add(p1, d1, L2);
            var d2 = dir(a2), p3 = add(p2, d2, L3);
            var d3 = dir(a3), p4 = add(p3, d3, L4);
            return { links: [p0, p1, p2, p3, p4], d3: d3, lat: [-sy, 0, cy] };
        }

        /* --- pick-and-place choreography (~15 s seamless loop) ---
           PICK/PLACE sit on the floor (y = 0) inside the reachable annulus,
           in the sector the arm faces. The grasp/release tuples below were
           solved numerically (2-link planar IK + chosen wrist pitch, then
           verified through fk) so the end-effector lands within 0.06 units
           of the cube center at both contacts. */
        var CYCLE = 15.0;
        var GRIP_OPEN = 0.085, GRIP_CLOSED = 0.035;
        var CUBE_E = 0.16;          /* workpiece edge                   */
        var CUBE_DY = 0.08;         /* EE hover above cube center at contact:
                                       tool stops at the cube top face so the
                                       fingers clamp the sides, not the top */
        var PICK = { th0: -1.25, r: 1.30 };
        var PLACE = { th0: -0.85, r: 1.15 };
        PICK.floor = [Math.cos(PICK.th0) * PICK.r, 0, Math.sin(PICK.th0) * PICK.r];
        PLACE.floor = [Math.cos(PLACE.th0) * PLACE.r, 0, Math.sin(PLACE.th0) * PLACE.r];
        PICK.contact = [PICK.floor[0], CUBE_E / 2 + CUBE_DY, PICK.floor[2]];
        PLACE.contact = [PLACE.floor[0], CUBE_E / 2 + CUBE_DY, PLACE.floor[2]];

        var KF_HOME    = [-0.55, -0.88, 1.32, -0.50];    /* iconic reaching pose  */
        var KF_PICK_A  = [-1.25, -0.742, 1.701, -1.958]; /* pre-grasp above PICK  */
        var KF_PICK_G  = [-1.25, -0.795, 1.399, -2.184]; /* grasp at PICK         */
        var KF_PLACE_A = [-0.85, -0.829, 1.924, -2.095]; /* pre-place above PLACE */
        var KF_PLACE_G = [-0.85, -0.873, 1.543, -2.470]; /* release at PLACE      */

        /* [time, pose] track; consecutive repeats are holds */
        var TRACK = [
            [0.0, KF_HOME], [1.4, KF_HOME],
            [3.0, KF_PICK_A], [3.9, KF_PICK_G], [4.6, KF_PICK_G],
            [5.5, KF_PICK_A],
            [7.3, KF_PLACE_A], [8.2, KF_PLACE_G], [8.9, KF_PLACE_G],
            [9.8, KF_PLACE_A],
            [11.6, KF_HOME], [15.0, KF_HOME]
        ];
        var GRASP_T = 4.55;    /* gripper fully closed around the cube   */
        var RELEASE_T = 8.30;  /* gripper starts opening, cube is set down */
        /* gripper aperture track: [time, lateral finger offset] */
        var AP_TRACK = [
            [0.0, GRIP_OPEN], [4.0, GRIP_OPEN], [GRASP_T, GRIP_CLOSED],
            [RELEASE_T, GRIP_CLOSED], [8.85, GRIP_OPEN], [15.0, GRIP_OPEN]
        ];
        /* arrivals not ending at a contact get a tiny servo-settle bounce */
        var WOB_T = [3.0, 5.5, 7.3, 9.8, 11.6];

        function easeInOut(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

        function clamp01(v, hi) { return v < 0 ? 0 : (v > hi ? hi : v); }

        function sampleTrack(track, tc) {
            for (var i = 0; i < track.length - 1; i++) {
                if (tc >= track[i][0] && tc <= track[i + 1][0]) {
                    var span = track[i + 1][0] - track[i][0];
                    var u = span > 0 ? (tc - track[i][0]) / span : 1;
                    return { a: track[i][1], b: track[i + 1][1], e: easeInOut(u) };
                }
            }
            return { a: track[0][1], b: track[0][1], e: 0 };
        }

        /* current joint pose: eased keyframe interpolation layered with
           a faint idle breathing plus a small damped settle bounce
           (<= 0.016 rad) right after non-contact arrivals */
        function poseAt(t, tc) {
            var s = sampleTrack(TRACK, tc);
            var p = [
                s.a[0] + (s.b[0] - s.a[0]) * s.e + 0.010 * Math.sin(t * 0.30),
                s.a[1] + (s.b[1] - s.a[1]) * s.e + 0.014 * Math.sin(t * 0.38),
                s.a[2] + (s.b[2] - s.a[2]) * s.e + 0.016 * Math.sin(t * 0.30 + 1.4),
                s.a[3] + (s.b[3] - s.a[3]) * s.e + 0.012 * Math.sin(t * 0.34 + 2.2)
            ];
            for (var wi = 0; wi < WOB_T.length; wi++) {
                var tau = tc - WOB_T[wi];
                if (tau > 0 && tau < 0.7) {
                    var wob = 0.016 * Math.exp(-5 * tau) * Math.sin(22 * tau);
                    p[1] += wob;
                    p[2] -= 0.7 * wob;
                    break;
                }
            }
            return p;
        }

        function apertureAt(tc) {
            var s = sampleTrack(AP_TRACK, tc);
            return s.a + (s.b - s.a) * s.e;
        }

        var cosT = Math.cos(TILT), sinT = Math.sin(TILT);

        function makeProjector() {
            var mobile = W < 900;
            var cx = mobile ? W * 0.5 : W * 0.68;
            /* mobile: push the scene below the bio text block */
            var cy = mobile ? H * 0.76 : H * 0.72;
            var scale = Math.min(W, H) * (mobile ? 0.24 : 0.26);
            var fn = function (p) {
                var x = p[0], y = p[1] - 0.8, z = p[2];
                var yy = y * cosT - z * sinT;
                var zz = y * sinT + z * cosT + 3.1;
                var s = 1.9 / zz;
                return [cx + x * s * scale, cy - yy * s * scale, s];
            };
            fn.scale = scale;   /* px per world unit at s = 1 (for line widths) */
            return fn;
        }

        function line(a, b, style, width) {
            ctx.strokeStyle = style;
            ctx.lineWidth = width || 1;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
        }

        /* circle on the floor plane (y = 0), projected point by point */
        function strokeRing(proj, radius, style) {
            ctx.beginPath();
            for (var i = 0; i <= 48; i++) {
                var ang = (i / 48) * TAU;
                var p = proj([Math.cos(ang) * radius, 0, Math.sin(ang) * radius]);
                if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
            }
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        /* circle around an arbitrary 3D center (any height), optionally dashed */
        function ring3(proj, c, radius, style, dash) {
            ctx.beginPath();
            for (var i = 0; i <= 40; i++) {
                var ang = (i / 40) * TAU;
                var p = proj([c[0] + Math.cos(ang) * radius, c[1], c[2] + Math.sin(ang) * radius]);
                if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
            }
            if (dash) ctx.setLineDash(dash);
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            ctx.stroke();
            if (dash) ctx.setLineDash([]);
        }

        /* arc of a circle around a 3D center, angles a0..a1 (world xz) */
        function ringArc(proj, c, radius, a0, a1, style) {
            ctx.beginPath();
            for (var i = 0; i <= 24; i++) {
                var ang = a0 + (a1 - a0) * (i / 24);
                var p = proj([c[0] + Math.cos(ang) * radius, c[1], c[2] + Math.sin(ang) * radius]);
                if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
            }
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        /* filled disc on the floor plane */
        function floorDisc(proj, x, z, radius, style) {
            ctx.beginPath();
            for (var i = 0; i <= 28; i++) {
                var ang = (i / 28) * TAU;
                var p = proj([x + Math.cos(ang) * radius, 0, z + Math.sin(ang) * radius]);
                if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
            }
            ctx.closePath();
            ctx.fillStyle = style;
            ctx.fill();
        }

        /* soft contact shadow: two layered discs, very low alpha */
        function softShadow(proj, x, z, radius, alpha) {
            floorDisc(proj, x, z, radius, 'rgba(20,20,19,' + (alpha * 0.5).toFixed(3) + ')');
            floorDisc(proj, x, z, radius * 0.62, 'rgba(20,20,19,' + alpha.toFixed(3) + ')');
        }

        /* tapered capsule outline between two projected points:
           two parallel ink lines + semicircle end caps (noCapB: flat tip) */
        function capsule(a, b, hwA, hwB, style, width, noCapB) {
            var dx = b[0] - a[0], dy = b[1] - a[1];
            var len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.5) return null;
            var ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
            ctx.strokeStyle = style;
            ctx.lineWidth = width || 1;
            ctx.beginPath();
            ctx.moveTo(a[0] + nx * hwA, a[1] + ny * hwA);
            ctx.lineTo(b[0] + nx * hwB, b[1] + ny * hwB);
            ctx.moveTo(a[0] - nx * hwA, a[1] - ny * hwA);
            ctx.lineTo(b[0] - nx * hwB, b[1] - ny * hwB);
            ctx.stroke();
            var ang = Math.atan2(uy, ux);
            ctx.beginPath(); ctx.arc(a[0], a[1], hwA, ang + Math.PI / 2, ang + 3 * Math.PI / 2); ctx.stroke();
            if (!noCapB) {
                ctx.beginPath(); ctx.arc(b[0], b[1], hwB, ang - Math.PI / 2, ang + Math.PI / 2); ctx.stroke();
            }
            return [nx, ny];
        }

        /* short stiffener rungs between the two bars of a parallelogram link */
        function struts(a, b, hwA, hwB, n, style) {
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            for (var k = 0; k < 3; k++) {
                var u = 0.30 + 0.25 * k;
                var cxp = a[0] + (b[0] - a[0]) * u, cyp = a[1] + (b[1] - a[1]) * u;
                var hw = (hwA + (hwB - hwA) * u) * 0.8;
                ctx.beginPath();
                ctx.moveTo(cxp + n[0] * hw, cyp + n[1] * hw);
                ctx.lineTo(cxp - n[0] * hw, cyp - n[1] * hw);
                ctx.stroke();
            }
        }

        /* joint housing: outer ring + inner race + center hub dot */
        function housing(p, r, style) {
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.stroke();
            ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.55, 0, TAU); ctx.stroke();
            ctx.fillStyle = style;
            ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(r * 0.18, 1.1), 0, TAU); ctx.fill();
        }

        /* small joint-angle indicator arc between two projected links */
        function angleArc(p, pa, pb, r, style) {
            var a1 = Math.atan2(pa[1] - p[1], pa[0] - p[0]);
            var a2 = Math.atan2(pb[1] - p[1], pb[0] - p[0]);
            var d = Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1));
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p[0], p[1], r, a1, a1 + d, d < 0); ctx.stroke();
        }

        /* 7 diagonal hatch strokes clipped to a screen quad */
        function hatchQuad(q, style) {
            var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
            for (var i = 0; i < 4; i++) {
                minX = Math.min(minX, q[i][0]); maxX = Math.max(maxX, q[i][0]);
                minY = Math.min(minY, q[i][1]); maxY = Math.max(maxY, q[i][1]);
            }
            var cxh = (minX + maxX) / 2, cyh = (minY + maxY) / 2;
            var span = (maxX - minX) + (maxY - minY);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(q[0][0], q[0][1]);
            for (i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]);
            ctx.closePath();
            ctx.clip();
            ctx.strokeStyle = style;
            ctx.lineWidth = 1;
            for (i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(cxh + i * 8 - span, cyh + span);
                ctx.lineTo(cxh + i * 8 + span, cyh - span);
                ctx.stroke();
            }
            ctx.restore();
        }

        /* wireframe workpiece cube; coral-tinted top, hatched near faces */
        function drawCube(proj, c, e) {
            var h = e / 2, V = [];
            for (var i = 0; i < 8; i++) {
                V.push(proj([
                    c[0] + ((i & 1) ? h : -h),
                    c[1] + ((i & 2) ? h : -h),
                    c[2] + ((i & 4) ? h : -h)
                ]));
            }
            var top = [2, 3, 7, 6];
            ctx.beginPath();
            for (i = 0; i < 4; i++) {
                if (i === 0) ctx.moveTo(V[top[i]][0], V[top[i]][1]);
                else ctx.lineTo(V[top[i]][0], V[top[i]][1]);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(194,94,62,0.13)';
            ctx.fill();
            /* hatch the two side faces closest to the viewer */
            var F = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
            var scored = [];
            for (i = 0; i < 4; i++) {
                var fs = 0;
                for (var j = 0; j < 4; j++) fs += V[F[i][j]][2];
                scored.push([fs, i]);
            }
            scored.sort(function (x, y) { return y[0] - x[0]; });
            for (i = 0; i < 2; i++) {
                var f = F[scored[i][1]];
                hatchQuad([V[f[0]], V[f[1]], V[f[2]], V[f[3]]], 'rgba(20,20,19,0.10)');
            }
            var E = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [3, 7], [2, 6]];
            for (i = 0; i < E.length; i++) {
                line(V[E[i][0]], V[E[i][1]], 'rgba(20,20,19,0.30)', 1);
            }
        }

        /* articulated two-segment parallel-jaw gripper: fingers rotate about
           the knuckle as the aperture changes. The knuckles sit OUTSIDE the
           workpiece silhouette (|lat| 0.09 > half edge 0.08) so the fingers
           can never intersect the cube; closed pads land flush on the side
           faces (0.093 -> 0.080) at mid height. */
        function drawGripper(proj, p4, d3, lat, ap) {
            var u = (ap - GRIP_CLOSED) / (GRIP_OPEN - GRIP_CLOSED);  /* 0 closed .. 1 open */
            var sig = 0.06 + 0.49 * u;                               /* knuckle spread     */
            var cs = Math.cos(sig), sn = Math.sin(sig);
            for (var side = -1; side <= 1; side += 2) {
                var K = [p4[0] + lat[0] * 0.09 * side, p4[1], p4[2] + lat[2] * 0.09 * side];
                var d1 = [d3[0] * cs + lat[0] * sn * side, d3[1] * cs, d3[2] * cs + lat[2] * sn * side];
                var M = [K[0] + d1[0] * 0.05, K[1] + d1[1] * 0.05, K[2] + d1[2] * 0.05];
                var T = [M[0] + d3[0] * 0.05, M[1] + d3[1] * 0.05, M[2] + d3[2] * 0.05];
                var Tp = [T[0] - lat[0] * 0.013 * side, T[1], T[2] - lat[2] * 0.013 * side];
                var pK = proj(K), pM = proj(M), pT = proj(T), pTp = proj(Tp);
                ctx.strokeStyle = 'rgba(194,94,62,0.6)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(pK[0], pK[1]);
                ctx.lineTo(pM[0], pM[1]);
                ctx.lineTo(pT[0], pT[1]);
                ctx.stroke();
                line(pT, pTp, 'rgba(194,94,62,0.6)', 1.5);
                ctx.fillStyle = 'rgba(194,94,62,0.5)';
                ctx.beginPath();
                ctx.arc(pK[0], pK[1], Math.max(1.7 * pK[2], 1.0), 0, TAU);
                ctx.fill();
            }
        }

        /* --- LiDAR perception layer (world coords, precomputed once) --- */
        var SWEEP_PERIOD = 7;              /* s per revolution          */
        var OMEGA = TAU / SWEEP_PERIOD;
        var SCAN_R = 1.85;                 /* scanner max range         */
        var TRAIL = 0.55;                  /* arc trail length (rad)    */
        var FLARE_T = 1.2;                 /* point flare decay (s)     */

        /* deterministic rng so the cloud is stable across reloads */
        function mulberry32(seed) {
            var s = seed >>> 0;
            return function () {
                s = (s + 0x6D2B79F5) >>> 0;
                var z = s;
                z = Math.imul(z ^ (z >>> 15), z | 1);
                z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
                return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
            };
        }

        /* jittered floor-grid point cloud, stored in polar form so the
           sweep hit-test is a cheap angle compare (~130 points) */
        var cloud = [];
        (function () {
            var rand = mulberry32(20260719);
            for (var gx = -6; gx <= 6; gx++) {
                for (var gz = -6; gz <= 6; gz++) {
                    var x = gx * 0.28 + (rand() - 0.5) * 0.17;
                    var z = gz * 0.28 + (rand() - 0.5) * 0.17;
                    var r = Math.sqrt(x * x + z * z);
                    if (r < 0.4 || r > SCAN_R) continue;
                    cloud.push({
                        r: r,
                        a: (Math.atan2(z, x) + TAU) % TAU,
                        s: 0.8 + rand() * 0.8
                    });
                }
            }
        })();

        /* end-effector trail: recent world positions, ~1.5 s of history */
        var trail = [];

        function step() {
            /* fully faded out (scrolled past the hero): keep the loop alive
               but draw nothing */
            if (fadeNow <= 0) { raf = requestAnimationFrame(step); return; }
            ctx.clearRect(0, 0, W, H);
            var t = (performance.now() / 1000 + t0);
            var tc = t % CYCLE;
            var proj = makeProjector();
            var i, a, b;

            /* current pose, gripper and workpiece state (all stateless in tc) */
            var pose = poseAt(t, tc);
            var arm = fk(pose[0], pose[1], pose[2], pose[3]);
            var p4 = arm.links[4];
            var ap = apertureAt(tc);
            var carried = tc >= GRASP_T && tc < RELEASE_T;
            var rest = tc < GRASP_T ? PICK.floor : PLACE.floor;
            var cubeC = carried ? [p4[0], p4[1] - CUBE_DY, p4[2]] : [rest[0], CUBE_E / 2, rest[2]];

            trail.push([p4[0], p4[1], p4[2], t]);
            while (trail.length > 2 && t - trail[0][3] > 1.5) trail.shift();
            if (trail.length > 95) trail.splice(0, trail.length - 95);

            /* floor grid (sketch table) */
            ctx.lineWidth = 1;
            for (i = -4; i <= 4; i++) {
                var g = i * 0.5;
                a = proj([g, 0, -2.0]); b = proj([g, 0, 2.0]);
                line(a, b, 'rgba(20,20,19,0.055)');
                a = proj([-2.0, 0, g]); b = proj([2.0, 0, g]);
                line(a, b, 'rgba(20,20,19,0.055)');
            }

            /* soft contact shadows on the floor: cube (grows/pales when
               lifted), end-effector and elbow */
            var liftC = clamp01(cubeC[1] - CUBE_E / 2, 0.5) / 0.5;
            softShadow(proj, cubeC[0], cubeC[2], 0.15 * (1 + 0.35 * liftC), 0.10 * (1 - 0.55 * liftC));
            var liftE = clamp01(p4[1], 0.8) / 0.8;
            softShadow(proj, p4[0], p4[2], 0.10 * (1 + 0.30 * liftE), 0.05 * (1 - 0.5 * liftE));
            softShadow(proj, arm.links[2][0], arm.links[2][2], 0.09, 0.035);

            /* concentric LiDAR range rings around the base */
            strokeRing(proj, 0.65, 'rgba(20,20,19,0.08)');
            strokeRing(proj, 1.25, 'rgba(20,20,19,0.08)');
            strokeRing(proj, SCAN_R, 'rgba(20,20,19,0.09)');

            /* base plate */
            strokeRing(proj, 0.30, 'rgba(20,20,19,0.18)');

            /* PLACE workstation: low plinth with a coral top ring,
               encircled by the floor reticle (ticks + pulsing dashed ring).
               The elevated top rings are depth-split: back halves are drawn
               here, front halves after the cube, so the rings wrap around a
               seated cube instead of crossing its front face. */
            var pf = PLACE.floor;
            ring3(proj, pf, 0.16, 'rgba(20,20,19,0.24)');
            for (i = 0; i < 3; i++) {
                var wa = i * TAU / 4;
                a = proj([pf[0] + Math.cos(wa) * 0.16, 0, pf[2] + Math.sin(wa) * 0.16]);
                b = proj([pf[0] + Math.cos(wa) * 0.15, 0.03, pf[2] + Math.sin(wa) * 0.15]);
                line(a, b, 'rgba(20,20,19,0.22)', 1);
            }
            ringArc(proj, [pf[0], 0.03, pf[2]], 0.15, 0, Math.PI, 'rgba(20,20,19,0.22)');
            ringArc(proj, [pf[0], 0.03, pf[2]], 0.15, 0, Math.PI, 'rgba(194,94,62,0.30)');
            for (i = 0; i < 4; i++) {
                var ta = i * TAU / 4;
                a = proj([pf[0] + Math.cos(ta) * 0.20, 0, pf[2] + Math.sin(ta) * 0.20]);
                b = proj([pf[0] + Math.cos(ta) * 0.27, 0, pf[2] + Math.sin(ta) * 0.27]);
                line(a, b, 'rgba(194,94,62,0.28)', 1);
            }
            ring3(proj, pf, 0.235,
                'rgba(194,94,62,' + (0.10 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.4))).toFixed(3) + ')', [3, 5]);

            /* grasp / release feedback: one expanding pulse ring per event */
            var pulseEvents = [[GRASP_T, PICK.floor], [RELEASE_T, PLACE.floor]];
            for (i = 0; i < pulseEvents.length; i++) {
                var age = (tc - pulseEvents[i][0] + CYCLE) % CYCLE;
                if (age < 0.8) {
                    ring3(proj, pulseEvents[i][1], 0.35 * (age / 0.8),
                        'rgba(194,94,62,' + (0.30 * (1 - age / 0.8)).toFixed(3) + ')');
                }
            }

            /* workpiece cube */
            drawCube(proj, cubeC, CUBE_E);

            /* workstation front layer: the elevated top-ring arcs and the
               near rim tick pass in front of a seated cube */
            ringArc(proj, [pf[0], 0.03, pf[2]], 0.15, Math.PI, TAU, 'rgba(20,20,19,0.22)');
            ringArc(proj, [pf[0], 0.03, pf[2]], 0.15, Math.PI, TAU, 'rgba(194,94,62,0.30)');
            a = proj([pf[0] + Math.cos(0.75 * TAU) * 0.16, 0, pf[2] + Math.sin(0.75 * TAU) * 0.16]);
            b = proj([pf[0] + Math.cos(0.75 * TAU) * 0.15, 0.03, pf[2] + Math.sin(0.75 * TAU) * 0.15]);
            line(a, b, 'rgba(20,20,19,0.22)', 1);

            /* floor point-cloud: faint ink dots that flare coral when
               the sweep beam passes over them */
            var phi = (t * OMEGA) % TAU;
            for (i = 0; i < cloud.length; i++) {
                var cp = cloud[i];
                var sp = proj([cp.r * Math.cos(cp.a), 0, cp.r * Math.sin(cp.a)]);
                ctx.fillStyle = 'rgba(20,20,19,0.07)';
                ctx.beginPath();
                ctx.arc(sp[0], sp[1], Math.max(1.0 * sp[2] * cp.s, 0.6), 0, TAU);
                ctx.fill();
                var ago = ((((phi - cp.a) % TAU) + TAU) % TAU) / OMEGA;
                if (ago < FLARE_T) {
                    var k = 1 - ago / FLARE_T;
                    ctx.fillStyle = 'rgba(194,94,62,' + (0.34 * k).toFixed(3) + ')';
                    ctx.beginPath();
                    ctx.arc(sp[0], sp[1], Math.max((1.3 + 1.6 * k) * sp[2] * cp.s, 0.8), 0, TAU);
                    ctx.fill();
                }
            }

            /* LiDAR sweep: thin coral ray from the base + fading arc trail */
            var origin = proj([0, 0, 0]);
            var tip = proj([Math.cos(phi) * SCAN_R, 0, Math.sin(phi) * SCAN_R]);
            line(origin, tip, 'rgba(194,94,62,0.32)', 1);
            var SLICES = 12;
            for (i = 0; i < SLICES; i++) {
                var a0 = phi - TRAIL * (i + 1) / SLICES;
                var a1 = phi - TRAIL * i / SLICES;
                var q0 = proj([Math.cos(a0) * SCAN_R, 0, Math.sin(a0) * SCAN_R]);
                var q1 = proj([Math.cos(a1) * SCAN_R, 0, Math.sin(a1) * SCAN_R]);
                line(q0, q1, 'rgba(194,94,62,' + (0.22 * (1 - i / SLICES)).toFixed(3) + ')', 1);
            }

            /* planned-trajectory hint: dashed coral path from the current
               end-effector to the current contact target, with waypoint
               dots; fades in on segment start and out near contact */
            var hintTarget = null, hintIn = 1;
            if (tc > 1.4 && tc < 3.9) { hintTarget = PICK.contact; hintIn = (tc - 1.4) / 0.35; }
            else if (tc > 5.5 && tc < 8.2) { hintTarget = PLACE.contact; hintIn = (tc - 5.5) / 0.35; }
            if (hintTarget) {
                var dx = hintTarget[0] - p4[0], dy = hintTarget[1] - p4[1], dz = hintTarget[2] - p4[2];
                var hd = Math.sqrt(dx * dx + dy * dy + dz * dz);
                var fade = Math.min(Math.max((hd - 0.06) / 0.30, 0), 1) * Math.min(hintIn, 1);
                if (fade > 0.02) {
                    var pts = [];
                    for (i = 0; i <= 4; i++) {
                        var hu = i / 4;
                        pts.push(proj([
                            p4[0] + dx * hu,
                            p4[1] + dy * hu + 0.10 * 4 * hu * (1 - hu) * Math.min(hd, 1),
                            p4[2] + dz * hu
                        ]));
                    }
                    ctx.setLineDash([4, 5]);
                    ctx.strokeStyle = 'rgba(194,94,62,' + (0.22 * fade).toFixed(3) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pts[0][0], pts[0][1]);
                    for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    for (i = 1; i <= 3; i++) {
                        ctx.fillStyle = 'rgba(194,94,62,' + (0.30 * fade).toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.arc(pts[i][0], pts[i][1], Math.max(1.4 * pts[i][2], 0.8), 0, TAU);
                        ctx.fill();
                    }
                }
            }

            /* end-effector trail: coral polyline, bright head fading to tail */
            if (trail.length > 1) {
                ctx.lineCap = 'round';
                for (i = 1; i < trail.length; i++) {
                    var tal = 0.28 * Math.pow(i / (trail.length - 1), 1.6);
                    if (tal < 0.01) continue;
                    line(proj(trail[i - 1]), proj(trail[i]), 'rgba(194,94,62,' + tal.toFixed(3) + ')', 1.5);
                }
                ctx.lineCap = 'butt';
            }

            /* robot arm — line-art sketch with real structure */
            var P = arm.links.map(proj);
            var ppu = proj.scale;

            /* flared base pedestal + mounting bolts on the base plate */
            ring3(proj, [0, 0, 0], 0.16, 'rgba(20,20,19,0.26)');
            ring3(proj, [0, 0.10, 0], 0.115, 'rgba(20,20,19,0.24)');
            line(proj([0.16, 0, 0]), proj([0.115, 0.10, 0]), 'rgba(20,20,19,0.24)', 1);
            line(proj([-0.16, 0, 0]), proj([-0.115, 0.10, 0]), 'rgba(20,20,19,0.24)', 1);
            for (i = 0; i < 4; i++) {
                var bang = Math.PI / 4 + i * Math.PI / 2;
                var bp = proj([Math.cos(bang) * 0.24, 0, Math.sin(bang) * 0.24]);
                ctx.fillStyle = 'rgba(20,20,19,0.22)';
                ctx.beginPath();
                ctx.arc(bp[0], bp[1], Math.max(1.3 * bp[2], 0.8), 0, TAU);
                ctx.fill();
            }

            /* tapered double-bar links (widths scale with projected depth) */
            var HW = [[0.072, 0.054], [0.058, 0.046], [0.046, 0.036], [0.028, 0.022]];
            var col0 = proj([0, 0.10, 0]);
            var pts2 = [col0, P[1], P[2], P[3], P[4]];
            for (i = 0; i < 4; i++) {
                var la = pts2[i], lb = pts2[i + 1];
                var ls = 'rgba(20,20,19,' + (0.17 + 0.14 * (la[2] + lb[2]) / 2).toFixed(3) + ')';
                var nn = capsule(la, lb, HW[i][0] * la[2] * ppu, HW[i][1] * lb[2] * ppu, ls, 1.2, i === 3);
                if (nn && (i === 1 || i === 2)) {
                    struts(la, lb, HW[i][0] * la[2] * ppu, HW[i][1] * lb[2] * ppu, nn,
                        'rgba(20,20,19,' + (0.10 + 0.08 * (la[2] + lb[2]) / 2).toFixed(3) + ')');
                }
            }

            /* joint housings + shoulder/elbow angle indicator arcs */
            var JR = [0, 0.072, 0.058, 0.045];
            for (i = 1; i <= 3; i++) {
                housing(P[i], JR[i] * P[i][2] * ppu, 'rgba(20,20,19,' + (0.20 + 0.12 * P[i][2]).toFixed(3) + ')');
            }
            angleArc(P[1], P[0], P[2], JR[1] * P[1][2] * ppu * 1.45, 'rgba(20,20,19,0.20)');
            angleArc(P[2], P[1], P[3], JR[2] * P[2][2] * ppu * 1.45, 'rgba(20,20,19,0.18)');

            /* articulated coral gripper */
            drawGripper(proj, p4, arm.d3, arm.lat, ap);

            /* end-effector hub + target ring */
            ctx.fillStyle = 'rgba(194,94,62,0.75)';
            ctx.beginPath();
            ctx.arc(P[4][0], P[4][1], Math.max(3.2 * P[4][2], 1.2), 0, TAU);
            ctx.fill();
            var ee = P[P.length - 1];
            ctx.strokeStyle = 'rgba(194,94,62,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ee[0], ee[1], 9 + 2.5 * Math.sin(t * 2.2), 0, TAU);
            ctx.stroke();

            raf = requestAnimationFrame(step);
        }

        function setRunning(on) {
            if (on && raf === null) raf = requestAnimationFrame(step);
            else if (!on && raf !== null) { cancelAnimationFrame(raf); raf = null; }
        }

        /* scroll-driven fade: the scene is a hero background — full opacity
           at the top, linear fade from 0.3x to 1.0x viewport height so it
           never peeks out from behind the publications cards */
        var fadeNow = 1, fadeQueued = false;
        function updateFade() {
            var y = window.scrollY || window.pageYOffset || 0;
            fadeNow = 1 - Math.min(1, Math.max(0, (y - H * 0.3) / (H * 0.7)));
            canvas.style.opacity = fadeNow.toFixed(3);
        }
        window.addEventListener('scroll', function () {
            if (!fadeQueued) {
                fadeQueued = true;
                requestAnimationFrame(function () {
                    fadeQueued = false;
                    updateFade();
                });
            }
        }, { passive: true });

        resize();
        step();
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', function () {
            setRunning(!document.hidden);
        });
    }

    /* ---------- 2. Hero typewriter ---------- */
    var typer = document.getElementById('typer');
    if (typer && !reduceMotion) {
        var phrases = null;
        try {
            phrases = JSON.parse(typer.getAttribute('data-phrases') || 'null');
        } catch (e) {
            phrases = null;
        }
        if (!Array.isArray(phrases)) {
            phrases = null;
        } else {
            phrases = phrases.filter(function (p) { return typeof p === 'string' && p.length > 0; });
            if (phrases.length === 0) phrases = null;
        }
        if (phrases) {
            if (phrases.length === 1) {
                typer.textContent = phrases[0];   /* single phrase: static */
            } else {
                var TYPE_MS = 55, HOLD_MS = 1600, DELETE_MS = 28;
                var pi = 0, pos = 0, mode = 'typing';
                /* start from whatever text is already rendered */
                var initial = typer.textContent;
                var hit = phrases.indexOf(initial);
                if (hit >= 0) {
                    pi = hit;
                    pos = initial.length;
                    mode = 'holding';
                } else {
                    typer.textContent = '';
                }
                var tickTyper = function () {
                    var cur = phrases[pi];
                    var delay;
                    if (mode === 'typing') {
                        pos++;
                        typer.textContent = cur.slice(0, pos);
                        if (pos >= cur.length) { mode = 'holding'; delay = HOLD_MS; }
                        else delay = TYPE_MS;
                    } else if (mode === 'holding') {
                        mode = 'deleting';
                        delay = DELETE_MS;
                    } else { /* deleting */
                        pos--;
                        typer.textContent = cur.slice(0, pos);
                        if (pos <= 0) {
                            pi = (pi + 1) % phrases.length;
                            mode = 'typing';
                            delay = TYPE_MS;
                        } else delay = DELETE_MS;
                    }
                    setTimeout(tickTyper, delay);
                };
                setTimeout(tickTyper, mode === 'holding' ? HOLD_MS : 600);
            }
        }
        /* no valid phrases: keep the server-rendered initial text */
    }

    /* ---------- 3. Metric counters ---------- */
    document.querySelectorAll('.metric-num[data-count]').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count'));
        if (isNaN(target)) return;
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        if (isNaN(decimals) || decimals < 0) decimals = 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        function setValue(v) {
            el.textContent = prefix + v.toFixed(decimals) + suffix;
        }
        if (reduceMotion || !('IntersectionObserver' in window)) {
            setValue(target);
            return;
        }
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                cio.unobserve(el);
                var start = null;
                var DUR = 1400;
                function tickCount(now) {
                    if (start === null) start = now;
                    var p = Math.min((now - start) / DUR, 1);
                    var e = 1 - Math.pow(1 - p, 3);   /* ease-out cubic */
                    setValue(target * e);
                    if (p < 1) requestAnimationFrame(tickCount);
                    else setValue(target);
                }
                requestAnimationFrame(tickCount);
            });
        }, { threshold: 0.35 });
        cio.observe(el);
    });

    /* ---------- 4. Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---------- 5. Copy chips + toast ---------- */
    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
    }

    document.querySelectorAll('[data-copy]').forEach(function (el) {
        el.addEventListener('click', function (ev) {
            ev.preventDefault();
            var text = el.getAttribute('data-copy');
            var msg = el.getAttribute('data-toast') || ('Copied: ' + text);
            function done() { showToast(msg); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, done);
            } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (e) { /* noop */ }
                document.body.removeChild(ta);
                done();
            }
        });
    });

    /* ---------- 6. Pointer tilt on publication cards ---------- */
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!reduceMotion && finePointer) {
        document.querySelectorAll('[data-tilt]').forEach(function (card) {
            var MAX_DEG = 2.5, LIFT = -4, LERP = 0.14;
            var rx = 0, ry = 0, ty = 0;          /* current values */
            var trx = 0, tryy = 0, tty = 0;      /* targets        */
            var rafTilt = null;

            function apply(x, y, z) {
                card.style.transform = 'perspective(900px) rotateX(' + x.toFixed(2) +
                    'deg) rotateY(' + y.toFixed(2) + 'deg) translateY(' + z.toFixed(1) + 'px)';
            }

            function frame() {
                rx += (trx - rx) * LERP;
                ry += (tryy - ry) * LERP;
                ty += (tty - ty) * LERP;
                var settled = Math.abs(trx - rx) < 0.02 &&
                              Math.abs(tryy - ry) < 0.02 &&
                              Math.abs(tty - ty) < 0.05;
                if (settled) {
                    if (trx === 0 && tryy === 0 && tty === 0) card.style.transform = '';
                    else apply(trx, tryy, tty);
                    rafTilt = null;
                    return;
                }
                apply(rx, ry, ty);
                rafTilt = requestAnimationFrame(frame);
            }

            function kick() {
                if (rafTilt === null) rafTilt = requestAnimationFrame(frame);
            }

            card.addEventListener('pointermove', function (ev) {
                var rect = card.getBoundingClientRect();
                var px = (ev.clientX - rect.left) / rect.width;
                var py = (ev.clientY - rect.top) / rect.height;
                /* hover-glow origin for CSS radial gradients */
                card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
                trx = (0.5 - py) * MAX_DEG * 2;    /* ±2.5deg around center */
                tryy = (px - 0.5) * MAX_DEG * 2;
                tty = LIFT;
                kick();
            });
            card.addEventListener('pointerleave', function () {
                trx = 0; tryy = 0; tty = 0;
                kick();
            });
        });
    }

    /* ---------- 7. Reduced motion: no video autoplay ---------- */
    if (reduceMotion) {
        document.querySelectorAll('video').forEach(function (v) {
            v.removeAttribute('autoplay');
            v.pause();
        });
    }
})();
