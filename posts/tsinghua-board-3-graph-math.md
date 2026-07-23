> **《清华机考板子》系列**：[总览](post.html?p=tsinghua-exam-cpp-template) · [（一）STL 与选型策略](post.html?p=tsinghua-board-1-stl) · [（二）贪心 / DP / 数据结构 / 基础算法](post.html?p=tsinghua-board-2-greedy-ds) · **（三）图论与数学** · [（四）字符串与大模拟](post.html?p=tsinghua-board-4-string-sim)

本篇对应板子 §7–§8，完整收录搜索、图论与数学数论的高频模板，每个模板含用途、思路、复杂度与可运行完整程序。

## 搜索与图论

建图前先确认有向图还是无向图。无向边必须加入两个方向。

### DFS / 回溯：全排列

> **用途**：枚举方案、排列组合、棋盘搜索。
>
> **思路**：像填数独一样逐位试数：每层挑一个还没用过的数填进当前位置，填满 \(n\) 位就输出一种方案。返回上一层前把数还回去（撤销选择），同层才能接着试下一个候选；明显走不通的分支尽早剪掉。全排列复杂度 \(O(n \cdot n!)\)。
>
> **输入输出**：输入 \(n\)，输出 1 到 \(n\) 的所有排列，适合 \(n \le 9\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 12;
int n, path[N];
bool used[N];

void Dfs(int depth) {
  // path[0..depth-1] 已确定，used 标记这些数不能再次选择。
  if (depth == n) {
    for (int i = 0; i < n; ++i) {
      cout << path[i] << (i + 1 == n ? '\n' : ' ');
    }
    return;
  }

  for (int value = 1; value <= n; ++value) {
    if (used[value]) continue;
    used[value] = true;
    path[depth] = value;
    Dfs(depth + 1);
    // 回溯：恢复现场，供同一层尝试下一个候选。
    used[value] = false;
  }
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  Dfs(0);
  return 0;
}
```

网格搜索常用方向数组：`int dx[4] = {-1, 0, 1, 0}; int dy[4] = {0, 1, 0, -1};`。搜索状态不只是坐标时，用 `string`、整数编码或 `tuple` 作为状态，并用哈希表判重。

### BFS：无权最短路

> **用途**：所有边代价相同，求最少经过多少条边。
>
> **思路**：像水波一样从起点一圈圈向外扩散：队列里的点按离起点的距离从小到大排开，第 1 圈处理完才到第 2 圈。一个点第一次被碰到时走的就是最短路径，所以当场记下距离、以后不再重复入队。复杂度 \(O(n + m)\)。
>
> **输入输出**：`n m s`，接着 \(m\) 条无向边。输出源点 `s` 到所有点的距离，不可达输出 `-1`。

按层入队：第 1 圈处理完才到第 2 圈，首次到达即最短路。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, m, source, dist[N];
vector<int> graph[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> source;
  while (m--) {
    int a, b;
    cin >> a >> b;
    graph[a].push_back(b);
    graph[b].push_back(a);
  }

  // -1 同时表示“尚未入队”和最终的“不可达”。
  memset(dist, -1, sizeof dist);
  queue<int> q;
  dist[source] = 0;
  q.push(source);
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (int v : graph[u]) {
      if (dist[v] != -1) continue;
      // 第一次入队就确定最短距离，并立即标记以避免重复入队。
      dist[v] = dist[u] + 1;
      q.push(v);
    }
  }

  for (int i = 1; i <= n; ++i) {
    cout << dist[i] << (i == n ? '\n' : ' ');
  }
  return 0;
}
```

### 拓扑排序

> **用途**：处理有向依赖关系、安排先后顺序或判断有向环。
>
> **思路**：反复执行“删掉一个没有前置要求的点”：入度为 0 的点先入队，每出队一个点，它所有后继的入度减 1，减到 0 的后继接着入队。最后出队不足 \(n\) 个点，说明剩下的点互相等待、图中有环。复杂度 \(O(n + m)\)。
>
> **输入输出**：`n m` 和 \(m\) 条有向边。输出一个拓扑序；有环输出 `-1`。

红字 = 入度；入度为 0 的点入队，出队时把每个后继的入度减 1。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, m, indegree[N];
vector<int> graph[N], order;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  while (m--) {
    int a, b;
    cin >> a >> b;
    graph[a].push_back(b);
    ++indegree[b];
  }

  queue<int> q;
  // 队列中始终是当前入度为 0、可以立刻删除的点。
  for (int i = 1; i <= n; ++i) {
    if (!indegree[i]) q.push(i);
  }

  while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);
    for (int v : graph[u]) {
      // 删除 u 后，只有入度刚好降为 0 的后继才能入队。
      if (--indegree[v] == 0) q.push(v);
    }
  }

  if (static_cast<int>(order.size()) != n) {
    cout << -1 << '\n';
  } else {
    for (int x : order) cout << x << ' ';
    cout << '\n';
  }
  return 0;
}
```

### 0-1 BFS

> **用途**：边权只有 0 和 1 的单源最短路。
>
> **思路**：把双端队列当成“便宜的先走”的等候区：刷新邻居距离（松弛）成功后，走 0 边到达的点没增加距离、塞到队首优先扩展，走 1 边到达的塞到队尾。队列里的距离因此始终有序，点第一次出队时距离已是最短。复杂度 \(O(n + m)\)。
>
> **输入输出**：`n m s`，接着 \(m\) 条有向边 `a b w`。输出到所有点的最短距离。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
const int INF = 0x3f3f3f3f;

int n, m, source, dist[N];
bool done[N];
vector<pair<int, int>> graph[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> source;
  while (m--) {
    int a, b, w;
    cin >> a >> b >> w;
    graph[a].push_back({b, w});
  }

  memset(dist, 0x3f, sizeof dist);
  deque<int> q;
  dist[source] = 0;
  q.push_front(source);
  while (!q.empty()) {
    int u = q.front();
    q.pop_front();
    if (done[u]) continue;
    // 首次确定出队后 dist[u] 已是最短距离，之后的重复项跳过。
    done[u] = true;
    for (auto [v, w] : graph[u]) {
      if (dist[v] <= dist[u] + w) continue;
      dist[v] = dist[u] + w;
      // 权 0 不增加距离，放队首；权 1 放队尾。
      if (w == 0) {
        q.push_front(v);
      } else {
        q.push_back(v);
      }
    }
  }

  for (int i = 1; i <= n; ++i) {
    cout << (dist[i] == INF ? -1 : dist[i]) << ' ';
  }
  cout << '\n';
  return 0;
}
```

### Dijkstra

> **用途**：非负权图的单源最短路。
>
> **思路**：小根堆每次抓出当前距离最小的点——它不可能再被更短的路绕到，最短路就此定死，再用它刷新各邻居的距离（松弛）。同一个点可能多次入堆，距离对不上当前记录的旧条目直接跳过。复杂度 \(O(m \log n)\)，不能有负权边。
>
> **输入输出**：`n m s`，接着 \(m\) 条有向边 `a b w`。输出到所有点的最短距离。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using pli = pair<ll, int>;
const int N = 200010;
const ll INF = 1LL << 62;

int n, m, source;
ll dist[N];
vector<pair<int, int>> graph[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> source;
  while (m--) {
    int a, b, w;
    cin >> a >> b >> w;
    graph[a].push_back({b, w});
  }

  fill(dist, dist + n + 1, INF);
  // pair 按距离、点编号依次比较，因此 greater<pli> 得到距离小根堆。
  priority_queue<pli, vector<pli>, greater<pli>> heap;
  dist[source] = 0;
  heap.push({0, source});

  while (!heap.empty()) {
    auto [distance, u] = heap.top();
    heap.pop();
    // 同一点可能多次入堆，只处理与当前最短距离一致的最新记录。
    if (distance != dist[u]) continue;
    for (auto [v, w] : graph[u]) {
      if (dist[v] <= distance + w) continue;
      dist[v] = distance + w;
      heap.push({dist[v], v});
    }
  }

  for (int i = 1; i <= n; ++i) {
    cout << (dist[i] == INF ? -1 : dist[i]) << ' ';
  }
  cout << '\n';
  return 0;
}
```

### Bellman-Ford：最多经过 \(k\) 条边

> **用途**：存在负权边，或路径最多只能使用 \(k\) 条边。
>
> **思路**：第 \(t\) 轮结束后，`dist` 存的是“至多走 \(t\) 条边”的最短路。每轮先把旧距离抄进 `backup`、本轮全靠旧值刷新（松弛），避免刚更新的结果当轮被接力、一轮走出多条边。复杂度 \(O(km)\)。
>
> **输入输出**：`n m k`，接着 \(m\) 条有向边。求 1 到 `n` 的最短路。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 510;
const ll INF = 1LL << 62;

struct Edge {
  int from, to, weight;
};

int n, m, k;
ll dist[N], backup[N];
vector<Edge> edges;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> k;
  for (int i = 0; i < m; ++i) {
    Edge edge;
    cin >> edge.from >> edge.to >> edge.weight;
    edges.push_back(edge);
  }

  fill(dist, dist + n + 1, INF);
  dist[1] = 0;
  while (k--) {
    // backup 固定为上一轮状态，保证本轮路径至多新增一条边。
    copy(dist, dist + n + 1, backup);
    for (const Edge& edge : edges) {
      if (backup[edge.from] == INF) continue;
      dist[edge.to] =
          min(dist[edge.to], backup[edge.from] + edge.weight);
    }
  }

  if (dist[n] == INF) {
    cout << "impossible\n";
  } else {
    cout << dist[n] << '\n';
  }
  return 0;
}
```

限制边数时必须使用 `backup`，否则同一轮会连续使用多条边。

### Floyd

> **用途**：\(n\) 不大，需要查询任意两点最短路。
>
> **思路**：一轮“开放”一个中转站：第 \(k\) 轮结束后，任意 \(i\) 到 \(j\) 的最短路只允许途经 \(1..k\) 号点，于是每个点对都试试绕经新开放的 \(k\)（`dist[i][k] + dist[k][j]`）是否更短，所以 \(k\) 必须套在最外层循环。复杂度 \(O(n^3)\)。
>
> **输入输出**：`n m q`、\(m\) 条有向边、\(q\) 组查询。

第 \(k\) 轮开放中转站 \(k\)：\(d[i][j]=\min(8,\ 2+3)=5\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 510;
const ll INF = 1LL << 62;

int n, m, q;
ll dist[N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> q;
  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= n; ++j) {
      dist[i][j] = (i == j ? 0 : INF);
    }
  }
  while (m--) {
    int a, b, w;
    cin >> a >> b >> w;
    dist[a][b] = min(dist[a][b], static_cast<ll>(w));
  }

  // k 必须在最外层：本轮结束后只允许 1..k 作为中间点。
  for (int k = 1; k <= n; ++k) {
    for (int i = 1; i <= n; ++i) {
      for (int j = 1; j <= n; ++j) {
        if (dist[i][k] == INF || dist[k][j] == INF) continue;
        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
      }
    }
  }

  while (q--) {
    int a, b;
    cin >> a >> b;
    if (dist[a][b] == INF) {
      cout << "impossible\n";
    } else {
      cout << dist[a][b] << '\n';
    }
  }
  return 0;
}
```

### Kruskal 最小生成树

> **用途**：无向图中以最小总边权连通所有点。
>
> **思路**：把边按权值从小到大排，贪心地一条条捡：两端还没连通的边就要下（用并查集把两块连成一块），已经连通的边直接跳过。捡够 \(n - 1\) 条边时，总代价一定最小。复杂度 \(O(m \log m)\)。
>
> **输入输出**：`n m` 和 \(m\) 条无向边，输出最小生成树权值；不连通输出 `impossible`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 200010;

struct Edge {
  int a, b, weight;
  bool operator<(const Edge& other) const {
    return weight < other.weight;
  }
};

int n, m, parent_node[N];
vector<Edge> edges;

int Find(int x) {
  // 路径压缩后，Find(x) 返回 x 所在连通块的代表元。
  if (parent_node[x] != x) parent_node[x] = Find(parent_node[x]);
  return parent_node[x];
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 0; i < m; ++i) {
    Edge edge;
    cin >> edge.a >> edge.b >> edge.weight;
    edges.push_back(edge);
  }
  sort(edges.begin(), edges.end());
  iota(parent_node, parent_node + n + 1, 0);

  ll answer = 0;
  int selected = 0;
  // 边已按权值升序；只选择连接两个不同连通块的边。
  for (const Edge& edge : edges) {
    int a = Find(edge.a);
    int b = Find(edge.b);
    if (a == b) continue;
    parent_node[a] = b;
    answer += edge.weight;
    ++selected;
  }

  if (selected != n - 1) {
    cout << "impossible\n";
  } else {
    cout << answer << '\n';
  }
  return 0;
}
```

### Tarjan 强连通分量

> **用途**：有向图中找互相可达的点集，常用于缩点后做 DAG 上的 DP。
>
> **思路**：DFS 时给每个点盖到达时间戳 `dfn`，`low[u]` 记录 \(u\) 的 DFS 子树沿返祖边能摸回的最小时间戳。若 `low[u] == dfn[u]`，说明子树摸不回 \(u\) 的上方，\(u\) 就是一个 SCC 的根，弹栈弹到 \(u\) 为止、收走整个分量。复杂度 \(O(n + m)\)。
>
> **输入输出**：输入 `n m` 和 \(m\) 条有向边，输出 SCC 数量以及每个点所属的 SCC 编号。

节点上方 \(dfn/low\)；返祖边（红）把 \(low\) 拉回祖先，\(low=dfn\) 时弹栈出一个 SCC。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 200010;

int n, m, timer, top, scc_count;
int dfn[N], low[N], stk[N], scc_id[N];
bool in_stack[N];
vector<int> graph[N];

void Tarjan(int u) {
  // dfn 是访问时间；low 是当前 DFS 子树能回到的最小 dfn。
  dfn[u] = low[u] = ++timer;
  // 栈中只保留尚未归属任何 SCC 的点。
  stk[++top] = u;
  in_stack[u] = true;

  for (int v : graph[u]) {
    if (!dfn[v]) {
      Tarjan(v);
      low[u] = min(low[u], low[v]);
    } else if (in_stack[v]) {
      // 只用仍在栈中的返祖/横叉边更新，已出栈 SCC 不参与。
      low[u] = min(low[u], dfn[v]);
    }
  }

  // dfn == low 表示 u 是一个 SCC 的搜索树根，弹到 u 为止。
  if (dfn[u] != low[u]) return;
  ++scc_count;
  int node;
  do {
    node = stk[top--];
    in_stack[node] = false;
    scc_id[node] = scc_count;
  } while (node != u);
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  while (m--) {
    int a, b;
    cin >> a >> b;
    graph[a].push_back(b);
  }

  for (int i = 1; i <= n; ++i) {
    if (!dfn[i]) Tarjan(i);
  }

  cout << scc_count << '\n';
  for (int i = 1; i <= n; ++i) {
    cout << scc_id[i] << (i == n ? '\n' : ' ');
  }
  return 0;
}
```

缩点时遍历原图边 `u -> v`，若 `scc_id[u] != scc_id[v]`，就在两个 SCC 之间连边。链状图递归可能爆栈，数据特别大时需要提高栈限制或改为迭代实现。

### 状态哈希 BFS（八数码）

> **用途**：求八数码（\(3 \times 3\)）从任意起始状态到目标状态的最少移动步数，并判不可达（2024 年清华 T1 同类）。
>
> **思路**：把每种棋盘摆法当成图上的一个点：9 字符状态串就是节点，空格与上下左右相邻格交换一次就走到下一个节点，边权都是 1，直接 BFS——首次碰到目标状态就是最少步数。`unordered_map<string, int>` 记步数兼判重；状态共 \(9! = 362880\) 种，队列跑空仍没到目标即不可达。复杂度 \(O(9! \times 9)\)，约 \(3 \times 10^6\) 次操作。
>
> **输入输出**：输入一行 9 字符起始状态（数字 1–8 加 `x` 表示空格），输出到 `12345678x` 的最少步数，不可达输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  string start;
  cin >> start;                       // 9 字符起始状态，x 表示空格
  const string target = "12345678x";
  const int dx[4] = {-1, 1, 0, 0};    // 空格四个方向移动
  const int dy[4] = {0, 0, -1, 1};
  unordered_map<string, int> dist;    // dist[s] = 起点到状态 s 的步数
  queue<string> q;
  dist[start] = 0;
  q.push(start);
  while (!q.empty()) {
    string cur = q.front();
    q.pop();
    int d = dist[cur];
    if (cur == target) {              // BFS 首次到达即最少步数
      cout << d << '\n';
      return 0;
    }
    int pos = (int)cur.find('x');     // 空格下标 0..8
    int r = pos / 3, c = pos % 3;
    for (int k = 0; k < 4; k++) {
      int nr = r + dx[k], nc = c + dy[k];
      if (nr < 0 || nr >= 3 || nc < 0 || nc >= 3) continue;
      string nxt = cur;
      swap(nxt[pos], nxt[nr * 3 + nc]);  // 空格与相邻格交换
      if (dist.count(nxt)) continue;     // 已入队过，跳过
      dist[nxt] = d + 1;
      q.push(nxt);
    }
  }
  cout << -1 << '\n';                 // BFS 跑完仍不可达
  return 0;
}
```

> **易错点**：一维下标与行列的换算是 `pos / 3`、`pos % 3`，交换对象是空格和相邻格；\(3 \times 3\) 中逆序对数为奇的状态必不可达，也可用它 \(O(1)\) 预判，BFS 写法则不依赖该结论。

图：BFS 把 9 字符状态串当作图节点，空格与相邻格交换生成后继状态（阴影格为空格 `x`）；首次到达 `12345678x` 的层数即最少步数。

### 有根树子树统计

> **用途**：统计有根树中子树大小（含自身）落在区间 `[L, R]` 内的点数（THU20224A 树上计数）。
>
> **思路**：先把父亲表翻成孩子邻接表，再自底向上累加：每个点的子树大小 = 1 + 所有儿子的子树大小，最后扫描一遍，统计大小落在 `[L, R]` 内的点数。复杂度 \(O(n)\)。
>
> **输入输出**：第一行 `N L R`；接下来 \(N - 1\) 行，第 \(i\) 行给出点 \(i + 1\) 的父亲，1 为根。输出：一个整数，满足 \(L \le \text{子树大小} \le R\) 的点数。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, l, r;
  cin >> n >> l >> r;
  vector<vector<int>> children(n + 1);   // 孩子邻接表，1 为根
  for (int i = 2; i <= n; ++i) {
    int p;
    cin >> p;                            // 点 i 的父亲
    children[p].push_back(i);
  }

  // N <= 1e5，链状树递归深度同阶，递归会爆栈，故用显式栈迭代。
  vector<int> order;                     // 先根序：父亲一定先于后代入列
  order.reserve(n);
  vector<int> stk = {1};
  while (!stk.empty()) {
    int u = stk.back();
    stk.pop_back();
    order.push_back(u);
    for (int v : children[u]) stk.push_back(v);
  }

  vector<int> sub(n + 1, 1);             // sub[u] = u 的子树大小（含自身）
  for (auto it = order.rbegin(); it != order.rend(); ++it) {
    int u = *it;                         // 逆序保证儿子先于父亲结算
    for (int v : children[u]) sub[u] += sub[v];
  }

  int ans = 0;
  for (int u = 1; u <= n; ++u) {
    if (l <= sub[u] && sub[u] <= r) ++ans;
  }
  cout << ans << '\n';
  return 0;
}
```

> **易错点**：\(N \le 10^5\) 时链状树递归深度同阶，递归 DFS 会爆栈；本模板用显式栈求先根序再逆序累加，等效后序遍历，不要改回递归。

### 二叉树重建与遍历

> **用途**：已知前序 + 中序序列（点权互不相同）重建二叉树，输出后序遍历（软院 2019、THU20224C 同类）。
>
> **思路**：前序的第一个元素就是当前子树的根；在中序里定位它，左边一段归左子树、右边一段归右子树，两段各自递归重建。`unordered_map` 预存“点权 \(\to\) 中序下标”让定位根 \(O(1)\)，前序游标每消费一个根前进一格。定位根 \(O(1)\)，整体 \(O(n)\)。
>
> **输入输出**：第一行 \(n\)；第二行前序序列；第三行中序序列。输出：一行后序遍历序列，空格分隔。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<int> pre(n), in(n);
  for (int& x : pre) cin >> x;
  for (int& x : in) cin >> x;

  unordered_map<int, int> pos;           // 点权 -> 中序下标，找根 O(1)
  pos.reserve(n * 2);                    // 预留桶，避免 rehash
  for (int i = 0; i < n; ++i) pos[in[i]] = i;

  // 用中序下标当节点编号，数组存左右儿子（-1 表示空儿子）。
  vector<int> lch(n, -1), rch(n, -1);
  int pre_idx = 0;                       // 前序游标，每建一个节点消费一格
  // 重建中序区间 [inl, inr] 对应的子树，返回根的编号。
  function<int(int, int)> Build = [&](int inl, int inr) -> int {
    if (inl > inr) return -1;
    int id = pos[pre[pre_idx++]];        // 前序首元素 = 当前子树的根
    lch[id] = Build(inl, id - 1);        // 中序根左侧是左子树；先建左，与前序顺序一致
    rch[id] = Build(id + 1, inr);
    return id;
  };
  int root = Build(0, n - 1);

  bool first = true;
  function<void(int)> PostOrder = [&](int u) {
    if (u == -1) return;
    PostOrder(lch[u]);
    PostOrder(rch[u]);
    if (!first) cout << ' ';             // 空格分隔，行首无前导空格
    first = false;
    cout << in[u];                       // 编号换回原始点权输出
  };
  PostOrder(root);
  cout << '\n';
  return 0;
}
```

> **易错点**：建树必须先递归左子树再递归右子树（与前序「根-左-右」的消费顺序一致），写反会建出镜像树；链状树时递归深度 \(O(n)\)，\(n\) 很大（约 \(10^5\) 以上）可能爆栈，需改显式栈迭代。

前序：\(\underbrace{1}_{\text{根}}\ \underbrace{2\ 4\ 5}_{\text{左子树}}\ \underbrace{3}_{\text{右子树}}\)

中序：\(\underbrace{4\ 2\ 5}_{\text{左子树}}\ \underbrace{1}_{\text{根}}\ \underbrace{3}_{\text{右子树}}\)

图：前序首元素确定当前子树的根，根在中序中的位置把序列划分为左、右子树两段，递归重建即可。

### 网格 BFS：连通块与网格最短路

> **用途**：棋盘/地图类题目数连通块（flood fill）、整片染色；把 `visited` 换成 `dist` 数组即得无权网格最短路，网格状搜索也是 2024 T1（类八数码）和水滴扩散的骨架。
>
> **思路**：把每个格子当成图上的一个点，用方向数组展开上下左右邻居；从每个尚未访问的可走格出发 BFS 一遍染满整块，出发几次就有几个连通块。复杂度 \(O(nm)\)。
>
> **输入输出**：输入 `n m` 和 `n` 行字符网格，`.` 可走、`#` 障碍。输出 `.` 连通块个数。

图：BFS 像水波从起点一圈圈向外扩散，格内数字即该格的 dist；数连通块时从每个未访问格各扩散一次。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 1010;

int n, m;
char grid[N][N];
bool visited[N][N];
// 四方向数组：上下左右；斜向连通时换成 8 个方向。
const int kDx[4] = {-1, 1, 0, 0};
const int kDy[4] = {0, 0, -1, 1};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 0; i < n; ++i) cin >> grid[i];

  int components = 0;
  for (int sx = 0; sx < n; ++sx) {
    for (int sy = 0; sy < m; ++sy) {
      if (grid[sx][sy] == '#' || visited[sx][sy]) continue;
      ++components;  // 发现新连通块，从 (sx,sy) 起 flood fill 染遍整块。
      queue<pair<int, int>> q;
      visited[sx][sy] = true;
      q.push({sx, sy});
      while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();
        for (int d = 0; d < 4; ++d) {
          int nx = x + kDx[d], ny = y + kDy[d];
          // 先判边界，再判可行与未访问，顺序不能反。
          if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
          if (grid[nx][ny] == '#' || visited[nx][ny]) continue;
          visited[nx][ny] = true;  // 入队即标记，防止重复入队。
          q.push({nx, ny});
        }
      }
    }
  }
  cout << components << '\n';
  return 0;
}
```

> **易错点**：先判边界、再判障碍、最后判访问标记，顺序错了会数组越界；入队立即标记，等出队才标记会让同一格重复入队、队列爆炸；斜向也算连通时把方向数组换成 8 个方向。

### 矩阵树定理：生成树计数

> **用途**：求无向图生成树的个数（THU20161D），模素数意义。
>
> **思路**：构造基尔霍夫矩阵——对角线放每个点的度数、每条边在两个端点位置记 \(-1\)；任意删去一行一列后求行列式，结果就是生成树个数。模意义下用高斯消元求行列式，「除以主元」换成「乘主元的逆元」。复杂度 \(O(n^3)\)。
>
> **输入输出**：输入 `n m` 和 `m` 条无向边（1-based）。输出生成树个数 mod \(10^9+7\)。

$$\begin{pmatrix} 2 & -1 & -1 \\ -1 & 2 & -1 \\ -1 & -1 & 2 \end{pmatrix} \to \det\begin{pmatrix} 2 & -1 \\ -1 & 2 \end{pmatrix} = 3$$

图：三角形的基尔霍夫矩阵删去一行一列后求行列式，得 3 棵生成树（\(K_n\) 有 \(n^{n-2}\) 棵，可用来对拍验证）。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 310;
const ll kMod = 1000000007;

int n, m;
ll mat[N][N];  // 基尔霍夫（拉普拉斯）矩阵，删去一行一列后求行列式

ll PowerMod(ll a, ll b) {
  ll answer = 1;
  while (b) {
    if (b & 1) answer = answer * a % kMod;
    a = a * a % kMod;
    b >>= 1;
  }
  return answer;
}

// 模意义高斯消元求 n 阶行列式（mat 会被破坏）。
ll Determinant(int n) {
  ll det = 1;
  for (int col = 0; col < n; ++col) {
    int pivot = col;
    while (pivot < n && mat[pivot][col] == 0) ++pivot;  // 找本列非零行
    if (pivot == n) return 0;                           // 全零列，行列式为 0
    if (pivot != col) {
      swap(mat[pivot], mat[col]);
      det = (kMod - det) % kMod;  // 换行行列式变号
    }
    det = det * mat[col][col] % kMod;
    ll inv = PowerMod(mat[col][col], kMod - 2);
    for (int row = col + 1; row < n; ++row) {
      ll factor = mat[row][col] * inv % kMod;
      for (int k = col; k < n; ++k) {
        mat[row][k] = (mat[row][k] - factor * mat[col][k] % kMod + kMod) % kMod;
      }
    }
  }
  return det;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 0; i < m; ++i) {
    int u, v;
    cin >> u >> v;
    --u;
    --v;
    // 拉普拉斯矩阵：度数放对角，每条边在两个端点间记 -1。
    ++mat[u][u];
    ++mat[v][v];
    mat[u][v] = (mat[u][v] + kMod - 1) % kMod;
    mat[v][u] = (mat[v][u] + kMod - 1) % kMod;
  }

  // 矩阵树定理：删去任意一行一列（此处删第 n-1 行/列）后的行列式即生成树个数。
  cout << Determinant(n - 1) << '\n';
  return 0;
}
```

> **易错点**：消元中每次减法后都要 `(x % mod + mod) % mod` 取正，负数主元求逆会出错；换行行列式变号；重边按次数重复计入度数和邻接；有向图求以 `r` 为根的树形图（THU20161D 原版）改用「入度矩阵 \(-\) 邻接矩阵」并删去根所在的行列，本模板是无向版本。

## 数学与数论

### 快速幂

> **用途**：指数很大时计算 \(a^b \bmod p\)。
>
> **思路**：求 \(a^{13}\) 不用乘 13 次：13 写成二进制 1101，即 \(a^{13} = a^8 \cdot a^4 \cdot a^1\)。底数每轮自己平方（\(a^1 \to a^2 \to a^4 \to a^8\)），指数当前位是 1 就把当前底数乘进答案。复杂度 \(O(\log b)\)。
>
> **输入输出**：输入 `a b p`，其中 \(b \ge 0\)、\(p > 0\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

ll PowerMod(ll a, ll b, ll mod) {
  ll answer = 1 % mod;
  a = (a % mod + mod) % mod;
  while (b) {
    // 当前二进制位为 1 时，把这一位对应的底数乘入答案。
    if (b & 1) answer = static_cast<__int128>(answer) * a % mod;
    // 底数平方对应下一位，指数右移丢掉已处理的最低位。
    a = static_cast<__int128>(a) * a % mod;
    b >>= 1;
  }
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  ll a, b, mod;
  cin >> a >> b >> mod;
  cout << PowerMod(a, b, mod) << '\n';
  return 0;
}
```

素数模 \(p\) 下，若 `x % p != 0`，则逆元为 `PowerMod(x, p - 2, p)`。

### 扩展欧几里得

> **用途**：求 \(ax + by = \gcd(a, b)\) 的一组整数解，或在合数模数下求逆元。
>
> **思路**：辗转相除到 `b == 0` 那一层时解是现成的（`x = 1, y = 0`）。递归返回路上，利用 `a % b = a - (a / b) * b` 把下一层算好的系数换算成本层的 `x`、`y`，层层回填即得一组解。复杂度 \(O(\log \min(a, b))\)。
>
> **输入输出**：输入 `a b`，输出 `gcd x y`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

ll ExtendedGcd(ll a, ll b, ll& x, ll& y) {
  if (!b) {
    // 此时 b = 0，取 x = 1、y = 0 即有 a*x + b*y = a。
    x = 1;
    y = 0;
    return a;
  }
  // 交换输出引用后，递归返回 b*y + (a%b)*x = gcd 的系数。
  ll d = ExtendedGcd(b, a % b, y, x);
  // a % b = a - (a / b) * b，反向代回当前层。
  y -= a / b * x;
  return d;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  ll a, b, x, y;
  cin >> a >> b;
  ll d = ExtendedGcd(a, b, x, y);
  cout << d << ' ' << x << ' ' << y << '\n';
  return 0;
}
```

模逆元存在的条件是 \(\gcd(a, \mathrm{mod}) = 1\)，结果记得规范到 \([0, \mathrm{mod})\)。

### 线性筛质数

> **用途**：一次求出 \(1 \sim n\) 内全部质数。
>
> **思路**：从小到大扫，没被筛掉的数就是质数，顺手拿它去筛掉一批合数。`i % primes[j] == 0` 时立刻停手，保证每个合数只被自己的最小质因子筛到一次，不做重复工。因此总复杂度 \(O(n)\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 10000010;
int primes[N], count_prime;
bool composite[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  for (int i = 2; i <= n; ++i) {
    if (!composite[i]) primes[count_prime++] = i;
    for (int j = 0; j < count_prime && primes[j] <= n / i; ++j) {
      composite[primes[j] * i] = true;
      // primes[j] 是 i 的最小质因子时停止，确保每个合数只筛一次。
      if (i % primes[j] == 0) break;
    }
  }

  cout << count_prime << '\n';
  for (int i = 0; i < count_prime; ++i) cout << primes[i] << ' ';
  cout << '\n';
  return 0;
}
```

单个整数分解质因数用试除法（软院 2019 真题）：因子成对出现，只需试到 \(\sqrt{n}\)，复杂度 \(O(\sqrt{n})\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  ll n;
  cin >> n;

  // 试除法：因子成对出现，只需试到 sqrt(n)。
  // 循环写法 i <= n / i 既防 i*i 溢出，又能随 n 变小自动收紧上界。
  for (ll i = 2; i <= n / i; ++i) {
    if (n % i != 0) continue;
    int exponent = 0;
    while (n % i == 0) {  // 把 i 这个质因子全部除尽
      n /= i;
      ++exponent;
    }
    cout << i << '^' << exponent << ' ';
  }
  // 除尽后剩下的 n 若大于 1，它本身就是最后一个质因子（指数 1）。
  if (n > 1) cout << n << "^1";
  cout << '\n';
  return 0;
}
```

> **易错点**：循环条件写 `i <= n / i` 而不是 `i * i <= n`，既防溢出又随 `n` 除小自动收紧；除尽后剩余的 `n > 1` 本身是最后一个质因子，别漏输出。

### 组合数：阶乘与逆阶乘

> **用途**：模数是素数，需要多次查询 \(C(n, k)\)。
>
> **思路**：模意义下没有除法，“除以 \(k!\)”要换成“乘 \(k!\) 的逆元”。预处理出所有阶乘，再用一次快速幂求出最大阶乘的逆元、倒推出全部逆阶乘，之后每次查询只做三次乘法。预处理 \(O(n)\)，单次 \(O(1)\)。
>
> **输入输出**：最大范围 `max_n`、查询数 `q`、素数模 `mod`，接着每次查询 `n k`。要求 `max_n < mod`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 1000010;

int max_n, q;
// fact[i] = i!；inverse_fact[i] = (i!)^{-1}，均对 mod 取模。
ll mod, fact[N], inverse_fact[N];

ll PowerMod(ll a, ll b) {
  ll answer = 1;
  while (b) {
    if (b & 1) answer = static_cast<__int128>(answer) * a % mod;
    a = static_cast<__int128>(a) * a % mod;
    b >>= 1;
  }
  return answer;
}

ll Combination(int n, int k) {
  if (k < 0 || k > n) return 0;
  return static_cast<__int128>(fact[n]) * inverse_fact[k] % mod *
         inverse_fact[n - k] % mod;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> max_n >> q >> mod;
  fact[0] = 1;
  for (int i = 1; i <= max_n; ++i) {
    fact[i] = static_cast<__int128>(fact[i - 1]) * i % mod;
  }
  inverse_fact[max_n] = PowerMod(fact[max_n], mod - 2);
  // 已知 (i!)^{-1}，乘 i 可得到 ((i - 1)!)^{-1}。
  for (int i = max_n; i >= 1; --i) {
    inverse_fact[i - 1] =
        static_cast<__int128>(inverse_fact[i]) * i % mod;
  }

  while (q--) {
    int n, k;
    cin >> n >> k;
    cout << Combination(n, k) << '\n';
  }
  return 0;
}
```

### 欧拉函数

> **用途**：求 \(1 \sim n\) 中与 \(n\) 互质的整数个数，常与欧拉定理、积性函数和数论博弈结合。
>
> **思路**：套公式 \(\varphi(n) = n \prod_p (1 - 1/p)\)：试除法每挖出一个不同的质因子 \(p\)，答案就乘一次 \((p - 1) / p\)（先除后乘，既整除又防溢出）。单次复杂度 \(O(\sqrt{n})\)。
>
> **输入输出**：输入正整数 \(n\)，输出 \(\varphi(n)\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

ll EulerPhi(ll value) {
  ll answer = value;
  ll remaining = value;
  for (ll factor = 2; factor <= remaining / factor; ++factor) {
    if (remaining % factor != 0) continue;
    // 每个不同质因子只应用一次 phi(n) *= (p - 1) / p。
    answer = answer / factor * (factor - 1);
    while (remaining % factor == 0) remaining /= factor;
  }
  if (remaining > 1) answer = answer / remaining * (remaining - 1);
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  ll n;
  cin >> n;
  cout << EulerPhi(n) << '\n';
  return 0;
}
```

### 高精度整数 `cpp_int`

> **用途**：整数超过 `long long`，又不需要手写十进制高精度时。GNU C++ 的 `cpp_int` 支持直接输入输出和常见整数运算，适合高精度签到题。
>
> **输入输出**：输入 `a op b`，其中 `op` 为 `+ - * / %`，输出运算结果；除法和取模保证 `b != 0`。

```cpp
#include <bits/stdc++.h>
#include <boost/multiprecision/cpp_int.hpp>
using namespace std;
using boost::multiprecision::cpp_int;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cpp_int a, b;
  char op;
  cin >> a >> op >> b;
  // cpp_int 是精确整数；除法仍为整数除法，结果向 0 截断。
  if (op == '+') cout << a + b << '\n';
  if (op == '-') cout << a - b << '\n';
  if (op == '*') cout << a * b << '\n';
  if (op == '/') cout << a / b << '\n';
  if (op == '%') cout << a % b << '\n';
  return 0;
}
```

若考场不允许 Boost，或题目要求展示过程，再使用 `vector<int>` 手写高精度。一般按十进制逆序存每一位，加减乘除时从低位向高位处理进位或借位。

### 矩阵快速幂

> **用途**：线性递推项数很大，能写成固定维度状态转移矩阵。
>
> **思路**：每递推一步相当于状态乘一次转移矩阵 \(T\)，递推 \(k\) 步就是乘 \(T^k\)。矩阵乘法满足结合律，直接套用快速幂那套“二进制拆指数、底数逐轮平方”，只是把数的乘法换成矩阵乘法。复杂度 \(O(n^3 \log \mathrm{exponent})\)。
>
> **输入输出**：输入矩阵阶数 `n`、指数 `exponent`、模数 `mod` 和一个方阵，输出矩阵幂。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using Matrix = vector<vector<ll>>;

Matrix Multiply(const Matrix& a, const Matrix& b, ll mod) {
  int n = static_cast<int>(a.size());
  Matrix result(n, vector<ll>(n));
  // i-k-j 顺序便于跳过 a[i][k] 为 0 的整段乘法。
  for (int i = 0; i < n; ++i) {
    for (int k = 0; k < n; ++k) {
      if (a[i][k] == 0) continue;
      for (int j = 0; j < n; ++j) {
        result[i][j] =
            (result[i][j] +
             static_cast<__int128>(a[i][k]) * b[k][j]) %
            mod;
      }
    }
  }
  return result;
}

Matrix MatrixPower(Matrix base, ll exponent, ll mod) {
  int n = static_cast<int>(base.size());
  Matrix result(n, vector<ll>(n));
  // 单位矩阵是矩阵乘法的 1，也对应 exponent = 0。
  for (int i = 0; i < n; ++i) result[i][i] = 1 % mod;
  while (exponent) {
    if (exponent & 1) result = Multiply(result, base, mod);
    base = Multiply(base, base, mod);
    exponent >>= 1;
  }
  return result;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  ll exponent, mod;
  cin >> n >> exponent >> mod;
  Matrix matrix(n, vector<ll>(n));
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
      cin >> matrix[i][j];
      matrix[i][j] = (matrix[i][j] % mod + mod) % mod;
    }
  }

  Matrix answer = MatrixPower(matrix, exponent, mod);
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
      cout << answer[i][j] << (j + 1 == n ? '\n' : ' ');
    }
  }
  return 0;
}
```

### 期望与函数图（售货机模型）

> **用途**：THU20212A 售货机一类「仅首次购买带概率、之后沿唯一出边转移」的期望支付问题。
>
> **思路**：在口 \(i\) 付 `a_i` 买一次：概率 `p_i` 拿到 \(i\)，概率 `1 - p_i` 拿到搭配的 `b_i`。一旦拿到不想要的 \(y\)，\(y\) 就断货了——再去口 \(y\) 只能拿到 \(b_y\)，于是顺着函数图 \(y \to b_y\) 边走、边付每个口的标价，直到拿到 \(x\) 或链成环报警。令 `future[y]` 为已拿到 \(y\) 后还需支付的总金额（`future[x] = 0`），从每个起点沿 \(b\) 链累加即得；答案为 \(\frac{1}{n} \sum_i \left( a_i + p_i \cdot \mathrm{future}[i] + (1 - p_i) \cdot \mathrm{future}[b_i] \right)\)。\(n \le 2000\)，直接 \(O(n^2)\)；用时间戳数组判环，避免每轮清空 `visited`。
>
> **输入输出**：输入第一行 `n x`（\(n\) 种饮料各 1 瓶、目标饮料 \(x\)），之后 \(n\) 行每行 `a_i b_i p_i`；输出期望支付金额，用 `fixed << setprecision(10)`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, x;
  cin >> n >> x;                        // n 种饮料各 1 瓶，目标饮料 x
  vector<ll> a(n + 1);
  vector<int> b(n + 1);
  vector<double> p(n + 1);
  for (int i = 1; i <= n; ++i) cin >> a[i] >> b[i] >> p[i];

  // future[y]：已经拿到不想要的 y 之后，还需支付的总金额
  vector<ll> future(n + 1, 0);
  vector<int> vis(n + 1, 0);            // 时间戳判环，stamp = 起点编号免清空
  for (int s = 1; s <= n; ++s) {
    ll sum = 0;
    int z = s;
    vis[z] = s;                         // y 已缺货，沿函数图 z -> b[z] 前进
    while (z != x) {
      sum += a[z];                      // 口 z 处 z 已无货，照付钱
      int w = b[z];
      if (vis[w] == s) break;           // b[z] 也无货，报警停止
      vis[w] = s;
      z = w;
    }
    future[s] = sum;                    // future[x] 自然为 0
  }

  double ans = 0;
  for (int i = 1; i <= n; ++i) {
    ans += a[i] + p[i] * future[i] + (1 - p[i]) * future[b[i]];
  }
  ans /= n;                             // 初始出售口等概率选择
  cout << fixed << setprecision(10) << ans << '\n';
  return 0;
}
```

> **易错点**：报警那一次照付钱，必须先累加 `a[z]` 再判 `b[z]` 是否缺货；时间戳直接拿起点编号当 stamp，\(n\) 轮互不冲突；`future[b_i]` 与 `future[i]` 同一定义，无需特判。

图：函数图 \(y \to b_y\) 上从起点沿唯一出边前进，到汇点 \(x\) 停止（\(\mathrm{future}[x] = 0\)），链成环则报警。每个起点 \(i\) 的期望 \(E_i = a_i + p_i \cdot \mathrm{future}[i] + (1 - p_i) \cdot \mathrm{future}[b_i]\)，答案为 \(\frac{1}{n} \sum_i E_i\)。

### 博弈 SG 与 Nim

> **用途**：两人轮流操作、无法操作者输的公平博弈，判先手必胜或必败（THU20212C Phi 的游戏第一问同类）。
>
> **思路**：一个局面的 SG 值 = 它能走到的所有后继局面 SG 值的 mex（最小未出现的非负整数）；SG 为 0 就是必败态——能走到 0 的必胜，只能走到非 0 的必败。多个互不影响的子游戏同时进行时，总 SG = 各子游戏 SG 值的异或（Nim 定理），非零先手必胜。数据小就打表，打出表后先观察有没有周期，有周期直接套公式。打表 \(O(N \cdot \text{操作数})\)，合并查询 \(O(n)\)。
>
> **输入输出**：输入堆数 `n` 和各堆石子数；规则为每次从一堆取走 1、2 或 3 个，取走最后者胜。输出 `Win` 或 `Lose`。

\(sg[4]\) 的后继是 \(sg[3],sg[2],sg[1]\)（红底），故 \(sg[4]=\mathrm{mex}\{3,2,1\}=0\)。

图：每次可取 1/2/3 个时 \(sg[x]=\mathrm{mex}\{sg[x-1],sg[x-2],sg[x-3]\}\)，打表得周期 \(0,1,2,3\)；多堆异或非零先手必胜。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 1000010;

int n;
// sg[x]：剩 x 个石子时当前玩家的 SG 值；sg[x]=0 表示必败。
int sg[N];
// 本题规则：一堆 x 个石子，每次可取 1、2 或 3 个，取走最后者胜。
const int kMoves[3] = {1, 2, 3};

// 打表求 sg[0..limit]：mex（最小未出现非负整数）规则。
void BuildSG(int limit) {
  sg[0] = 0;
  for (int x = 1; x <= limit; ++x) {
    bool reached[64] = {};
    for (int move : kMoves) {
      if (x >= move) reached[sg[x - move]] = true;
    }
    while (sg[x] < 64 && reached[sg[x]]) ++sg[x];  // mex
  }
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  vector<int> a(n);
  int limit = 0;
  for (auto& x : a) {
    cin >> x;
    limit = max(limit, x);
  }
  BuildSG(limit);

  // 多堆独立游戏 = 各堆 SG 值异或（Nim 定理）；非 0 先手必胜。
  int nim = 0;
  for (int x : a) nim ^= sg[x];
  cout << (nim ? "Win" : "Lose") << '\n';
  return 0;
}
```

> **易错点**：mex 的 `reached` 数组要按 SG 值上界开，`k` 个操作时 SG 值不超过 `k`；终止局面 `sg[0] = 0` 先定好；多堆合并是异或不是相加；规则稍变就要重打表——先打小表观察周期，再考虑写通项公式。
