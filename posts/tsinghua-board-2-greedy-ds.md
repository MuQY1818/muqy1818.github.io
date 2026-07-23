> **《清华机考板子》系列**：[总览](post.html?p=tsinghua-exam-cpp-template) · [（一）STL 与选型策略](post.html?p=tsinghua-board-1-stl) · **（二）贪心 / DP / 数据结构 / 基础算法** · [（三）图论与数学](post.html?p=tsinghua-board-3-graph-math) · [（四）字符串与大模拟](post.html?p=tsinghua-board-4-string-sim)

本篇对应板子 §3–§6，完整收录贪心、动态规划、数据结构与基础算法的高频模板，每个模板含用途、思路、复杂度与可运行完整程序。

## 贪心

贪心必须能用交换论证说明“当前选择不会让最优解变差”。证明不了时优先考虑 DP。

| 问题 | 排序或选择规则 |
| --- | --- |
| 最大不相交区间数 / 区间最少选点 | 按右端点升序 |
| 区间最少分组 | 按左端点升序，小根堆维护各组右端点 |
| 最少区间覆盖目标段 | 按左端点升序，每轮选最远右端点 |
| 合并果子 | 每次合并最小的两堆 |
| 总等待时间最小 | 按处理时间升序 |
| 数轴距离和最小 | 取中位数 |

### 最大不相交区间数量

> **用途**：从若干区间中选择尽量多的互不相交区间。
>
> **思路**：像排会议室：按结束时间排序，每空出来就接下一个能开且最早结束的区间。结束越早留下的空档越多，这样选不会更差。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入 `n` 和 `n` 个闭区间。输出最多能选择多少个两两不相交区间。复杂度 \(O(n \log n)\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Range {
  int left, right;
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<Range> ranges(n);
  for (Range& range : ranges) cin >> range.left >> range.right;
  // 结束越早越优先，为后续区间留下尽量大的空间。
  sort(ranges.begin(), ranges.end(), [](const Range& a, const Range& b) {
    return a.right < b.right;
  });

  int answer = 0;
  // last_right 是最近一次已选区间的右端点。
  int last_right = numeric_limits<int>::lowest();
  for (const Range& range : ranges) {
    if (range.left > last_right) {
      ++answer;
      last_right = range.right;
    }
  }
  cout << answer << '\n';
  return 0;
}
```

如果端点相等也算不相交，把 `range.left > last_right` 改成 `>=`。

### 最少区间覆盖

> **用途**：用最少候选区间完整覆盖一个目标区间。
>
> **思路**：像铺板过河：每轮从所有左端够得着当前位置的区间里，挑右端最远的踩上去。位置严格右移，一步都迈不出去时就是无解。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入目标区间 `[start, target]`、区间数 `n` 和所有候选区间。输出最少使用数量，无解输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Range {
  int left, right;
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int start, target, n;
  cin >> start >> target >> n;
  vector<Range> ranges(n);
  for (Range& range : ranges) cin >> range.left >> range.right;
  // 按左端点排序后，能接上当前位置的区间会连续出现。
  sort(ranges.begin(), ranges.end(), [](const Range& a, const Range& b) {
    return a.left < b.left;
  });

  int answer = 0;
  int index = 0;
  while (start < target) {
    // 本轮查看所有 left <= start 的区间，只选右端点最远者。
    int farthest = start;
    while (index < n && ranges[index].left <= start) {
      farthest = max(farthest, ranges[index].right);
      ++index;
    }
    if (farthest == start) {
      // 覆盖端点无法向右推进，说明目标区间无解。
      cout << -1 << '\n';
      return 0;
    }
    start = farthest;
    ++answer;
  }
  cout << answer << '\n';
  return 0;
}
```

### 合并果子

> **用途**：反复合并两项且代价为两项之和，求最小总代价。
>
> **思路**：每次从小根堆取出最小的两堆合并后放回。小堆先合能让大堆少被重复计费（Huffman 贪心）。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入 `n` 堆果子的重量。每次合并两堆，代价为两堆重量和，输出最小总代价。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  priority_queue<ll, vector<ll>, greater<ll>> heap;
  while (n--) {
    ll x;
    cin >> x;
    heap.push(x);
  }

  ll answer = 0;
  while (heap.size() > 1) {
    // 堆中始终保存当前尚未合并的所有果堆。
    ll a = heap.top();
    heap.pop();
    ll b = heap.top();
    heap.pop();
    answer += a + b;
    heap.push(a + b);
  }
  cout << answer << '\n';
  return 0;
}
```

### 流水线调度：Johnson 规则

> **用途**：\(n\) 个工件必须先在机器 A 加工 \(a_i\) 时间、再在机器 B 加工 \(b_i\) 时间（双机流水车间，顺序不可调换），求使全部完工时间（makespan）最小的加工顺序。典型题：清华机考「理发店」（洗发 + 剪发）。
>
> **思路**：Johnson 规则——\(a_i \le b_i\) 的工件按 \(a_i\) 升序放前面，\(a_i > b_i\) 的工件按 \(b_i\) 降序放后面。直观理解：A 快 B 慢的工件尽早开工让 B 不闲着，A 慢 B 快的工件尽量拖后避免占着 A。排好序后模拟两遍流水线算完工时间。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入 `n` 及每个工件的 \(a_i, b_i\)，输出最早完工时间。
>
> **备用**：\(n \le 10\) 时直接 `next_permutation` 全排列枚举 + 模拟，\(O(n! \cdot n)\)，忘记规则也能过。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<ll> a(n), b(n);
  for (int i = 0; i < n; ++i) cin >> a[i] >> b[i];

  // Johnson 规则：a<=b 的按 a 升序在前，a>b 的按 b 降序在后。
  vector<int> front, back;
  for (int i = 0; i < n; ++i)
    (a[i] <= b[i] ? front : back).push_back(i);
  sort(front.begin(), front.end(), [&](int i, int j) { return a[i] < a[j]; });
  sort(back.begin(), back.end(), [&](int i, int j) { return b[i] > b[j]; });

  vector<int> order = front;
  order.insert(order.end(), back.begin(), back.end());

  // 模拟流水线：ta 为机器 A 空闲时刻，tb 为机器 B 空闲时刻。
  ll ta = 0, tb = 0;
  for (int i : order) {
    ta += a[i];            // A 顺序加工，无等待
    tb = max(tb, ta) + b[i]; // B 必须等该工件从 A 下来
  }
  cout << tb << '\n';      // tb 即全部完工时间
  return 0;
}
```

## 动态规划

写 DP 前固定四件事：状态含义、转移来源、初始化、遍历顺序。

### 01 背包

> **用途**：每个物品最多选一次，在容量限制下求最大价值。
>
> **思路**：每件物品只做一次选或不选的决定，`dp[c]` 记录容量 `c` 下的最大价值。容量倒序枚举，读到的都是放这件之前的旧值，同一件才不会被装两次。复杂度 \(O(nm)\)。
>
> **输入输出**：输入物品数 `n`、容量 `m`，每件物品的体积和价值，输出最大价值。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, m;
// dp[c]：容量不超过 c 时，当前已处理物品能得到的最大价值。
ll dp[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 1; i <= n; ++i) {
    int volume;
    ll value;
    cin >> volume >> value;
    // 倒序更新，保证本轮读取的是加入当前物品之前的状态。
    for (int capacity = m; capacity >= volume; --capacity) {
      dp[capacity] = max(dp[capacity], dp[capacity - volume] + value);
    }
  }
  cout << dp[m] << '\n';
  return 0;
}
```

- 完全背包：容量循环改为从 `volume` 到 `m` 正序。
- 多重背包：把数量拆成 `1, 2, 4, ...`，每组按 01 背包处理。
- 恰好装满求最大值：除 `dp[0] = 0` 外，其余状态初始化为负无穷。

### 最长上升子序列 LIS

> **用途**：求严格递增子序列的最大长度。
>
> **思路**：`tails[len]` 存长度 `len + 1` 递增子序列的最小结尾，结尾越小越容易往后接。新数用 `lower_bound` 找到位置替换掉旧结尾，全比它小就追加。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入 `n` 和 `n` 个整数，输出 LIS 长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  // tails[i] 是长度为 i + 1 的递增子序列中，可能的最小末尾。
  // tails 只用于求长度，本身不一定是一条原数组中的 LIS。
  vector<int> tails;
  for (int i = 0; i < n; ++i) {
    int x;
    cin >> x;
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) {
      tails.push_back(x);
    } else {
      *it = x;
    }
  }
  cout << tails.size() << '\n';
  return 0;
}
```

最长不下降子序列把 `lower_bound` 改成 `upper_bound`。

### 最长公共子序列 LCS

> **用途**：两个序列都允许删除元素，求最长相同子序列。
>
> **思路**：像填表一样逐格推：`dp[i][j]` 是 a 前 `i` 个字符与 b 前 `j` 个字符的答案。末位字符相同就从左上角加一接上，不同就从左、上两格取较大者。复杂度 \(O(nm)\)。
>
> **输入输出**：输入两个字符串，输出 LCS 长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 2010;
// dp[i][j]：a 的前 i 个字符与 b 的前 j 个字符的 LCS 长度。
int dp[N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  string a, b;
  cin >> a >> b;
  int n = a.size();
  int m = b.size();
  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
      if (a[i - 1] == b[j - 1]) {
        dp[i][j] = max(dp[i][j], dp[i - 1][j - 1] + 1);
      }
    }
  }
  cout << dp[n][m] << '\n';
  return 0;
}
```

### 区间 DP：石子合并

> **用途**：只能合并相邻区间，总代价由两个子区间和整段代价组成。
>
> **思路**：把每段 `[l, r]` 想成最后被一刀分成两段：`dp[l][r]` 枚举这一刀的位置，取两段代价加整段重量的最小值。按长度递增计算，子区间总是先算好。复杂度 \(O(n^3)\)。
>
> **输入输出**：输入 `n` 堆石子，输出合并成一堆的最小代价。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 510;
const ll INF = 1LL << 62;

int n;
ll prefix[N], dp[N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 1; i <= n; ++i) {
    ll x;
    cin >> x;
    prefix[i] = prefix[i - 1] + x;
  }

  // dp[i][i] 全局初始化为 0；按长度递增保证子区间已经求出。
  for (int length = 2; length <= n; ++length) {
    for (int left = 1; left + length - 1 <= n; ++left) {
      int right = left + length - 1;
      dp[left][right] = INF;
      // split 枚举最后一次合并的左右两段。
      for (int split = left; split < right; ++split) {
        dp[left][right] =
            min(dp[left][right],
                dp[left][split] + dp[split + 1][right] +
                    prefix[right] - prefix[left - 1]);
      }
    }
  }
  cout << dp[1][n] << '\n';
  return 0;
}
```

### 树形 DP：没有上司的舞会

> **用途**：树上每个节点选或不选，并带有父子互斥限制。
>
> **思路**：`dp[u][0/1]` 是以 u 为根的子树中不选/选 u 的最优值。DFS 回传时逐层汇总：选 u 则下属全不选，不选 u 则下属任选。复杂度 \(O(n)\)。
>
> **输入输出**：输入 `n`、每人的快乐值、`n-1` 组 `child boss`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n;
// dp[u][0/1]：以 u 为根的子树中，不选/选择 u 的最大快乐值。
ll happy[N], dp[N][2];
bool has_parent[N];
vector<int> children[N];

void TreeDp(int u) {
  dp[u][1] = happy[u];
  for (int v : children[u]) {
    TreeDp(v);
    // 不选 u 时子节点任选；选择 u 时子节点必须不选。
    dp[u][0] += max(dp[v][0], dp[v][1]);
    dp[u][1] += dp[v][0];
  }
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 1; i <= n; ++i) cin >> happy[i];
  for (int i = 1; i < n; ++i) {
    int child, boss;
    cin >> child >> boss;
    children[boss].push_back(child);
    has_parent[child] = true;
  }

  int root = 1;
  while (has_parent[root]) ++root;
  TreeDp(root);
  cout << max(dp[root][0], dp[root][1]) << '\n';
  return 0;
}
```

### 状态压缩 DP：最短 Hamilton 路径

> **用途**：`n <= 20`，要求每个点恰好访问一次。
>
> **思路**：用一个整数的二进制位记录哪些点已访问（状压）：`dp[state][last]` 是访问完 `state` 且停在 `last` 的最短路。转移时把 `last` 从集合划掉，枚举上一步站在哪个点。
>
> **输入输出**：输入 `n` 和邻接矩阵。复杂度 \(O(2^n \cdot n^2)\)，内存约 80 MB。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 20;
const int INF = 0x3f3f3f3f;

int n, weight[N][N];
// dp[state][last]：从 0 出发，访问 state 中所有点并停在 last 的最短路。
int dp[1 << N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) cin >> weight[i][j];
  }

  memset(dp, 0x3f, sizeof dp);
  // state = 1 只包含起点 0。
  dp[1][0] = 0;
  for (int state = 1; state < (1 << n); ++state) {
    for (int last = 0; last < n; ++last) {
      if (!(state >> last & 1)) continue;
      // 删除终点 last，枚举到达 last 之前所在的点。
      int previous_state = state ^ (1 << last);
      for (int previous = 0; previous < n; ++previous) {
        if (!(previous_state >> previous & 1)) continue;
        dp[state][last] =
            min(dp[state][last],
                dp[previous_state][previous] + weight[previous][last]);
      }
    }
  }
  cout << dp[(1 << n) - 1][n - 1] << '\n';
  return 0;
}
```

枚举子集是状压题的常客（THU20203C 连通图方案数、THU20254C 乐园亲子问答）：`sub = (sub - 1) & mask` 恰好不重不漏地走遍 `mask` 的全部非空子集；若对每个 `mask` 都枚举其子集，总代价是 \(O(3^n)\) 而不是 \(O(4^n)\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, mask;
  cin >> n;
  vector<ll> a(n);
  for (auto& x : a) cin >> x;
  cin >> mask;  // 二进制第 i 位为 1 表示选中 a[i]

  // 枚举 mask 的全部非空子集：sub 每次“减 1 再与 mask 取交”，
  // 恰好不重不漏地走遍所有子集，共 2^popcount(mask) - 1 个。
  for (int sub = mask; sub; sub = (sub - 1) & mask) {
    ll sum = 0;
    for (int i = 0; i < n; ++i) {
      if (sub >> i & 1) sum += a[i];
    }
    cout << sub << ": " << sum << '\n';
  }
  return 0;
}
```

### 分段 DP：划分 k 段最小代价

> **用途**：把 `n` 个物品按顺序分成 `k` 个连续段，使各段代价之和最小（THU20162D 军训队列：每段代价为组内身高极差的平方）。
>
> **思路**：先按关键字排序——交叉的两段重新划分不会变差，所以最优解中每段成员在排序后一定连续，「选成员」就退化成「切刀口」。\(dp[i][j]\) 表示前 \(j\) 个物品分成 \(i\) 段的最小代价，枚举最后一段从谁开始转移。复杂度 \(O(k \cdot n^2)\)，`n, k <= 500` 约 \(6 \times 10^7\) 可过；加强版数据需要决策单调性等优化，超出主板范围。
>
> **输入输出**：输入 `n k` 和 `n` 个身高。输出最小总代价。

$$dp[i][j] = \min_{i-1 \le t < j} \{\, dp[i-1][t] + (h[j] - h[t+1])^2 \,\}$$

排序后最优分段必为连续段；枚举最后一段左端 \(t+1\)，该段极差即 \(h[j]-h[t+1]\)（样例：身高 \(1,2,3,100\) 分 2 段，最优 \(\{1,2,3\},\{100\}\)，总代价 4）。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 510;

int n, k;
ll h[N];
// dp[i][j]：前 j 个人分成 i 段的最小代价。
ll dp[N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> k;
  for (int i = 1; i <= n; ++i) cin >> h[i];
  // 最优分段的组员按身高一定连续，先排序把“选组”变成“切段”。
  sort(h + 1, h + n + 1);

  memset(dp, 0x3f, sizeof dp);
  dp[0][0] = 0;
  for (int i = 1; i <= k; ++i) {
    for (int j = 1; j <= n; ++j) {
      // 枚举第 i 段的左端：第 t+1..j 人合成一段，极差即 h[j]-h[t+1]。
      for (int t = i - 1; t < j; ++t) {
        ll range = h[j] - h[t + 1];
        dp[i][j] = min(dp[i][j], dp[i - 1][t] + range * range);
      }
    }
  }
  cout << dp[k][n] << '\n';
  return 0;
}
```

> **注意**：不排序直接 DP 会漏掉最优分段；`dp` 两维含义（段数、人数）别开反；极差平方再累计会爆 `int`，全程 `long long`。

## 数据结构

### 并查集

> **用途**：反复合并集合，并查询两点是否连通。
>
> **思路**：每个集合认一个老大（代表元），是不是一伙比老大即可。查找时让沿途节点直接认老大（路径压缩），合并时小树挂大树，树一直很矮。单次操作均摊近似 \(O(1)\)。
>
> **输入输出**：输入 `n m`，操作 `M a b` 表示合并，`Q a b` 表示查询。

按集合大小合并时，小树根接到大树根下，树高为 3；Find 路径压缩使沿途节点直接指向代表元，树被压扁，后续查询接近 \(O(1)\)。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, m, parent_node[N], set_size[N];

int Find(int x) {
  // 路径压缩：查询后让沿途节点直接指向集合代表元。
  if (parent_node[x] != x) parent_node[x] = Find(parent_node[x]);
  return parent_node[x];
}

void Merge(int a, int b) {
  a = Find(a);
  b = Find(b);
  if (a == b) return;
  // 按集合大小合并，始终把小集合接到大集合下面。
  if (set_size[a] < set_size[b]) swap(a, b);
  parent_node[b] = a;
  set_size[a] += set_size[b];
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 1; i <= n; ++i) {
    parent_node[i] = i;
    set_size[i] = 1;
  }

  while (m--) {
    char op;
    int a, b;
    cin >> op >> a >> b;
    if (op == 'M') {
      Merge(a, b);
    } else {
      cout << (Find(a) == Find(b) ? "Yes" : "No") << '\n';
    }
  }
  return 0;
}
```

### 单调栈

> **用途**：求每个元素左右第一个更大或更小的元素。
>
> **思路**：新数 `x` 到来时，栈里比它大的都不可能再当答案（`x` 更近更小），直接弹掉；弹完后栈单调递增，栈顶就是左侧最近的更小值。复杂度 \(O(n)\)。
>
> **输入输出**：输入 `n` 和数组，输出对应答案，不存在输出 `-1`。求更大时反转比较符号。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, stk[N], top;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  while (n--) {
    int x;
    cin >> x;
    // 弹出 >= x 的值后，栈严格递增，栈顶就是左侧最近较小值。
    while (top && stk[top] >= x) --top;
    cout << (top ? stk[top] : -1) << ' ';
    stk[++top] = x;
  }
  cout << '\n';
  return 0;
}
```

### 单调队列：滑动窗口最值

> **用途**：求固定长度窗口的最小值或最大值。
>
> **思路**：队列存下标且对应值保持单调：滑出窗口的从队首删，比新数更差的从队尾删（它们永无机会），队首就是当前窗口的最值。复杂度 \(O(n)\)。
>
> **输入输出**：输入 `n k` 和数组，第一行输出窗口最小值，第二行输出窗口最大值。

以求最大值为例：窗口 \([3,5]\)（\(k=3\)）内双端队列保存下标，对应值单调递减，队首下标 4 的值 5 即当前窗口最大值；新元素入队前先从队尾弹出所有不大于它的元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 1000010;
int n, k, a[N], q[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> k;
  for (int i = 0; i < n; ++i) cin >> a[i];

  int head = 0, tail = -1;
  for (int i = 0; i < n; ++i) {
    // q 保存下标：先删窗口左侧的过期下标。
    while (head <= tail && q[head] <= i - k) ++head;
    // 求最小值时，队列对应的值严格递增，队首始终最小。
    while (head <= tail && a[q[tail]] >= a[i]) --tail;
    q[++tail] = i;
    if (i >= k - 1) cout << a[q[head]] << ' ';
  }
  cout << '\n';

  head = 0;
  tail = -1;
  for (int i = 0; i < n; ++i) {
    while (head <= tail && q[head] <= i - k) ++head;
    // 求最大值时反转比较符号，使队列对应的值严格递减。
    while (head <= tail && a[q[tail]] <= a[i]) --tail;
    q[++tail] = i;
    if (i >= k - 1) cout << a[q[head]] << ' ';
  }
  cout << '\n';
  return 0;
}
```

### 树状数组

> **用途**：单点修改与前缀和、区间和查询。
>
> **思路**：`lowbit(x)` 是 x 二进制最低位的 1；`tree[x]` 存以 x 结尾、这么长的一段区间和。修改向上跳、查询向下跳，把前缀拆成几段相加。单次操作 \(O(\log n)\)，下标从 1 开始。
>
> **输入输出**：输入 `n m`、初始数组；`C x delta` 单点加，`Q l r` 查询区间和。

下标 \(1\sim 8\) 的树状数组：`c[i]` 管理以 `i` 结尾、长度 \(\mathrm{lowbit}(i)\) 的区间，如 `c[4]` 管 \([1,4]\)、`c[8]` 管 \([1,8]\)。修改沿 `i += lowbit(i)` 向上更新，查询沿 `i -= lowbit(i)` 向下累加。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, m;
// tree[x] 保存以 x 结尾、长度为 Lowbit(x) 的区间和。
ll tree[N];

int Lowbit(int x) {
  return x & -x;
}

void Add(int x, ll delta) {
  // 向上更新所有包含位置 x 的树状数组节点。
  for (; x <= n; x += Lowbit(x)) tree[x] += delta;
}

ll Sum(int x) {
  // 每次去掉最低位 1，将 [1, x] 拆成不重叠区间。
  ll answer = 0;
  for (; x > 0; x -= Lowbit(x)) answer += tree[x];
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 1; i <= n; ++i) {
    ll x;
    cin >> x;
    Add(i, x);
  }

  while (m--) {
    char op;
    cin >> op;
    if (op == 'C') {
      int x;
      ll delta;
      cin >> x >> delta;
      Add(x, delta);
    } else {
      int left, right;
      cin >> left >> right;
      cout << Sum(right) - Sum(left - 1) << '\n';
    }
  }
  return 0;
}
```

### 线段树：区间加、区间和

> **用途**：区间修改和区间查询交错出现。
>
> **思路**：每个节点存区间和；整段修改先在本节点记一笔账（懒标记）不碰孩子，等访问到子区间时再下传结清，省下整棵子树的遍历。单次操作 \(O(\log n)\)。
>
> **输入输出**：输入 `n m`、初始数组；`C l r delta` 区间加，`Q l r` 查询区间和。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, m;
// sum[u] 是节点区间和；lazy[u] 是尚未下传给子节点的区间增量。
ll a[N], sum[N * 4], lazy[N * 4];

void PushUp(int u) {
  sum[u] = sum[u << 1] + sum[u << 1 | 1];
}

void Apply(int u, int l, int r, ll delta) {
  // 整段加 delta，区间和增加 delta * 区间长度。
  sum[u] += delta * (r - l + 1);
  lazy[u] += delta;
}

void PushDown(int u, int l, int r) {
  if (!lazy[u] || l == r) return;
  // 访问子区间前，把父节点积累的修改传给两个孩子。
  int mid = (l + r) >> 1;
  Apply(u << 1, l, mid, lazy[u]);
  Apply(u << 1 | 1, mid + 1, r, lazy[u]);
  lazy[u] = 0;
}

void Build(int u, int l, int r) {
  if (l == r) {
    sum[u] = a[l];
    return;
  }
  int mid = (l + r) >> 1;
  Build(u << 1, l, mid);
  Build(u << 1 | 1, mid + 1, r);
  PushUp(u);
}

void AddRange(int u, int l, int r, int ql, int qr, ll delta) {
  // 当前节点被查询区间完整覆盖时直接打标记，不再递归。
  if (ql <= l && r <= qr) {
    Apply(u, l, r, delta);
    return;
  }
  PushDown(u, l, r);
  int mid = (l + r) >> 1;
  if (ql <= mid) AddRange(u << 1, l, mid, ql, qr, delta);
  if (qr > mid) AddRange(u << 1 | 1, mid + 1, r, ql, qr, delta);
  PushUp(u);
}

ll Query(int u, int l, int r, int ql, int qr) {
  if (ql <= l && r <= qr) return sum[u];
  PushDown(u, l, r);
  int mid = (l + r) >> 1;
  ll answer = 0;
  if (ql <= mid) answer += Query(u << 1, l, mid, ql, qr);
  if (qr > mid) answer += Query(u << 1 | 1, mid + 1, r, ql, qr);
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 1; i <= n; ++i) cin >> a[i];
  Build(1, 1, n);

  while (m--) {
    char op;
    int l, r;
    cin >> op >> l >> r;
    if (op == 'C') {
      ll delta;
      cin >> delta;
      AddRange(1, 1, n, l, r, delta);
    } else {
      cout << Query(1, 1, n, l, r) << '\n';
    }
  }
  return 0;
}
```

## 基础算法

### 二分查找

> **用途**：在有序数组中找值、边界，或在单调答案空间中找最优值。
>
> **思路**：每轮用中点判定把不可能的一半整个扔掉，保持目标始终在当前区间内；区间砍到只剩一个时就是答案。单次查询 \(O(\log n)\)。
>
> **输入输出**：输入 `n q`，一个长度为 `n` 的数组，接着 `q` 个查询值。输出每个值第一次和最后一次出现的 0-based 下标，不存在输出 `-1 -1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, q, a[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> q;
  for (int i = 0; i < n; ++i) cin >> a[i];

  while (q--) {
    int x;
    cin >> x;
    // lower_bound 找第一个 >= x；upper_bound 找第一个 > x。
    int left = lower_bound(a, a + n, x) - a;
    int right = upper_bound(a, a + n, x) - a - 1;
    if (left < n && a[left] == x) {
      cout << left << ' ' << right << '\n';
    } else {
      cout << "-1 -1\n";
    }
  }
  return 0;
}
```

> **注意**：二分答案时先写单调的 `Check(mid)`。找最小可行值用下中位数；找最大可行值用上中位数 `mid = (left + right + 1) >> 1`，避免死循环。

### 一维前缀和

> **用途**：数组不修改，需要多次查询区间和。
>
> **思路**：`prefix[i]` 是前 `i` 项的总和；问 `[l, r]` 的和时，用前 `r` 项总和减去前 `l-1` 项总和，一次减法出答案。预处理 \(O(n)\)，查询 \(O(1)\)。
>
> **输入输出**：输入 `n q`、长度为 `n` 的数组、`q` 个闭区间 `[l, r]`，下标从 1 开始。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, q;
// prefix[i] 表示前 i 个数之和，prefix[0] = 0。
ll prefix[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> q;
  for (int i = 1; i <= n; ++i) {
    ll x;
    cin >> x;
    prefix[i] = prefix[i - 1] + x;
  }

  while (q--) {
    int l, r;
    cin >> l >> r;
    cout << prefix[r] - prefix[l - 1] << '\n';
  }
  return 0;
}
```

二维前缀和公式：`s[x2][y2] - s[x1-1][y2] - s[x2][y1-1] + s[x1-1][y1-1]`。

### 一维差分

> **用途**：多次给区间整体加值，最后统一还原数组。
>
> **思路**：`diff[i]` 只记相邻两项的差（前缀和的逆操作）：给 `[l, r]` 加 `delta` 只需 `diff[l]` 加、`diff[r + 1]` 减两笔，最后求前缀和还原数组。每次修改 \(O(1)\)。
>
> **输入输出**：输入 `n m`、初始数组、`m` 次操作 `l r delta`。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, m;
// diff[i] = a[i] - a[i - 1]，对 diff 求前缀和即可还原 a。
ll a[N], diff[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m;
  for (int i = 1; i <= n; ++i) cin >> a[i];
  for (int i = 1; i <= n; ++i) diff[i] = a[i] - a[i - 1];

  while (m--) {
    int l, r;
    ll delta;
    cin >> l >> r >> delta;
    // r + 1 处减去 delta，使影响恰好在区间右侧结束。
    diff[l] += delta;
    diff[r + 1] -= delta;
  }

  for (int i = 1; i <= n; ++i) {
    diff[i] += diff[i - 1];
    cout << diff[i] << (i == n ? '\n' : ' ');
  }
  return 0;
}
```

### 双指针：最长不重复连续子数组

> **用途**：寻找满足条件的最长或最短连续区间，且窗口具有单调性。
>
> **思路**：右指针扩张窗口，新元素导致不合法就推进左指针把它挤出去，恢复合法后更新答案。两指针都只进不退，每个元素最多进出窗口一次。复杂度 \(O(n)\)。
>
> **输入输出**：输入 `n` 和数组，输出最长无重复连续子数组长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
int n, a[N];
unordered_map<int, int> cnt;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 0; i < n; ++i) cin >> a[i];

  int answer = 0;
  for (int left = 0, right = 0; right < n; ++right) {
    ++cnt[a[right]];
    // 循环结束后窗口 [left, right] 内每个值至多出现一次。
    while (cnt[a[right]] > 1) --cnt[a[left++]];
    answer = max(answer, right - left + 1);
  }
  cout << answer << '\n';
  return 0;
}
```

> **注意**：窗口和约束中如果存在负数，左右边界通常不再单调，应改用前缀和加哈希或有序结构。

### 归并排序求逆序对

> **用途**：统计满足 `i < j` 且 `a[i] > a[j]` 的逆序对。
>
> **思路**：归并两段有序数组时，一旦先取右边元素，它比左边剩下的所有元素都小，一次数出一大批逆序对；各层计数累加即答案。复杂度 \(O(n \log n)\)。
>
> **输入输出**：输入 `n` 和数组，输出逆序对数量。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 100010;

int n, a[N], temp[N];

ll MergeSort(int left, int right) {
  if (left >= right) return 0;
  int mid = (left + right) >> 1;
  ll answer = MergeSort(left, mid) + MergeSort(mid + 1, right);

  int i = left, j = mid + 1, k = left;
  // 左右两段均已排序；右值更小时，左侧剩余元素都与它构成逆序对。
  while (i <= mid && j <= right) {
    if (a[i] <= a[j]) {
      temp[k++] = a[i++];
    } else {
      temp[k++] = a[j++];
      answer += mid - i + 1;
    }
  }
  while (i <= mid) temp[k++] = a[i++];
  while (j <= right) temp[k++] = a[j++];
  for (int p = left; p <= right; ++p) a[p] = temp[p];
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 0; i < n; ++i) cin >> a[i];
  cout << MergeSort(0, n - 1) << '\n';
  return 0;
}
```

### 计数与归一化统计

> **用途**：把一组对象归入「等价类」后做频次/对数统计；同族题型有众数（频数最大的数，THU20161A）、MEX（最小未出现的非负整数，THU20162A）、斜率统计（斜率 `k` 为整数时判 `dy == k * dx`，THU20253A）。
>
> **思路**：把同一对象的不同写法归一成唯一「标准形」，再数每种标准形出现几次。以相似三角形（THU20254A）为例：三边先排序统一边序，再整体除以 gcd 得到本原比例三元组，用 `map` 计数；每类内部两两相似，贡献 `C(cnt, 2)` 对。复杂度每组数据 \(O(n \log n)\)。
>
> **输入输出**：输入第一行 `T` 组数据；每组第一行 `n`，随后 `n` 行每行三个整数为三角形三边（顺序任意）。输出：每组一行，相似三角形的对数。

```cpp
// 同族题型：众数 = 频数最大的数；MEX = 最小未出现的非负整数；
// 斜率统计 = 斜率 k 为整数时判 dy == k * dx。
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int t;
  cin >> t;
  while (t--) {
    int n;
    cin >> n;
    map<array<int, 3>, ll> cnt;          // 归一化三元组 -> 出现次数
    for (int i = 0; i < n; ++i) {
      array<int, 3> e;
      cin >> e[0] >> e[1] >> e[2];
      sort(e.begin(), e.end());          // 边序任意，先排序统一顺序
      int g = __gcd(e[0], __gcd(e[1], e[2]));
      for (int& x : e) x /= g;           // 整体除以 gcd，得到本原比例
      ++cnt[e];
    }
    ll ans = 0;
    for (const auto& kv : cnt) {
      ll c = kv.second;
      ans += c * (c - 1) / 2;            // 同类两两相似：C(c, 2)
    }
    cout << ans << '\n';
  }
  return 0;
}
```

> **注意**：必须先排序再约 gcd，顺序反了等价类会错；`C(cnt, 2)` 在 `n` 较大时超过 int，答案用 `long long`。

### 分组 + 二分：八方向命中计数

> **用途**：静态点集多次询问「过 \((a,b)\) 的横线/竖线/两条对角线上，切比雪夫距离 \(\le k\) 的点有几个」。典型题：清华机考「幻彩气球射击」（THU20254B，八向激光）。
>
> **思路**：同一条横线上的点 \(x\) 相同，竖线 \(y\) 相同，主对角线 \(x-y\) 相同，副对角线 \(x+y\) 相同。预先用四个 `map<ll, vector<ll>>` 按这四个键分组并存下沿射线方向的坐标，组内排序；每次查询在四个组里各做一次 `lower_bound`/`upper_bound` 区间计数即可。预处理 \(O(n \log n)\)，单次查询 \(O(\log n)\)。
>
> **输入输出**：输入 `n q`、`n` 个点坐标、`q` 次查询 `a b k`；输出每次命中的点数。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

// 统计 mp[key] 中位于 [L, R] 的数有几个
ll countRange(const map<ll, vector<ll>>& mp, ll key, ll L, ll R) {
  auto it = mp.find(key);
  if (it == mp.end()) return 0;
  const vector<ll>& v = it->second;
  return upper_bound(v.begin(), v.end(), R) - lower_bound(v.begin(), v.end(), L);
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, q;
  cin >> n >> q;

  // 分组键：横线按 x、竖线按 y、主对角线按 x-y、副对角线按 x+y。
  map<ll, vector<ll>> hor, ver, dig1, dig2;
  for (int i = 0; i < n; i++) {
    ll x, y;
    cin >> x >> y;
    hor[x].push_back(y);      // 横线上存 y
    ver[y].push_back(x);      // 竖线上存 x
    dig1[x - y].push_back(x); // 对角线上沿方向存 x 即可
    dig2[x + y].push_back(x);
  }
  for (auto& [key, v] : hor) sort(v.begin(), v.end());
  for (auto& [key, v] : ver) sort(v.begin(), v.end());
  for (auto& [key, v] : dig1) sort(v.begin(), v.end());
  for (auto& [key, v] : dig2) sort(v.begin(), v.end());

  while (q--) {
    ll a, b, k;
    cin >> a >> b >> k;
    ll ans = 0;
    ans += countRange(hor, a, b - k, b + k);       // 横线：|y-b|<=k
    ans += countRange(ver, b, a - k, a + k);       // 竖线：|x-a|<=k
    ans += countRange(dig1, a - b, a - k, a + k);  // 主对角线
    ans += countRange(dig2, a + b, a - k, a + k);  // 副对角线
    ll center = countRange(hor, a, b, b);          // (a,b) 上的点被数了 4 次
    ans -= 3 * center;
    cout << ans << '\n';
  }
  return 0;
}
```

> **注意**：交点 \((a,b)\) 处若有气球会被四个方向各计一次，要减去多算的 3 次；坐标取负时 \(x-y\)、\(x+y\) 仍为合法 `map` 键，无需偏移；答案用 `long long`。

### 二维前缀和与二维差分

> **用途**：静态网格多次查询子矩形和（前缀和）；或多次给子矩形整体加值、最后统一输出（差分）。
>
> **思路**：\(s[i][j]\) 记左上角 \((1,1)\) 到 \((i,j)\) 的总和；问一块子矩形时，「大矩形减去上面一块、减去左边一块、加回多减的左上角」容斥得出。预处理 \(O(nm)\)，查询 \(O(1)\)。二维差分是它的逆操作：矩形整体加 `delta` 只需在四个角打标记，全部改完后做一遍二维前缀和把网格还原出来，每次修改 \(O(1)\)。
>
> **输入输出**：前缀和——输入 `n m q`、`n` 行网格、`q` 次查询 `x1 y1 x2 y2`；差分——输入 `n m q`、`q` 次修改 `x1 y1 x2 y2 delta`，网格初始全 0，输出最终网格。

子矩形和 \(= s[x_2][y_2] - s[x_1-1][y_2] - s[x_2][y_1-1] + s[x_1-1][y_1-1]\)（行列均从 1 开始，左上为原点）；差分是逆操作，四角打标记 \(+\delta/-\delta/-\delta/+\delta\) 后前缀和还原。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 1010;

int n, m, q;
// s[i][j] 表示以 (1,1) 为左上角、(i,j) 为右下角的矩形内所有数之和。
ll s[N][N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> q;
  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
      ll x;
      cin >> x;
      // 容斥：加上左边和上边，减去重复算的左上角，再加上自己。
      s[i][j] = s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1] + x;
    }
  }

  while (q--) {
    int x1, y1, x2, y2;
    cin >> x1 >> y1 >> x2 >> y2;
    // 容斥取子矩形：大矩形减上、左两块，加回多减的左上角。
    cout << s[x2][y2] - s[x1 - 1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1]
         << '\n';
  }
  return 0;
}
```

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 1010;

int n, m, q;
// diff 是二维差分数组；对它求二维前缀和即可还原每个格子的最终值。
ll diff[N][N];

// 给矩形 (x1,y1)-(x2,y2) 整体加 delta：只动四个角。
void Add(int x1, int y1, int x2, int y2, ll delta) {
  diff[x1][y1] += delta;
  diff[x2 + 1][y1] -= delta;      // 右侧界外抵消
  diff[x1][y2 + 1] -= delta;      // 下侧界外抵消
  diff[x2 + 1][y2 + 1] += delta;  // 右下角补回多减的部分
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n >> m >> q;
  while (q--) {
    int x1, y1, x2, y2;
    ll delta;
    cin >> x1 >> y1 >> x2 >> y2 >> delta;
    Add(x1, y1, x2, y2, delta);
  }

  // 逐格做二维前缀和，把差分还原成原数组。
  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
      diff[i][j] += diff[i - 1][j] + diff[i][j - 1] - diff[i - 1][j - 1];
      cout << diff[i][j] << (j == m ? '\n' : ' ');
    }
  }
  return 0;
}
```

> **注意**：下标从 1 开始，第 0 行第 0 列留作天然边界，免去边界特判；容斥符号是「加减减加」，背错一个全错；差分 `Add` 的两个界外角是 `(x2+1, y1)` 与 `(x1, y2+1)`，别写成 `(x2, y1)`。

### 排序 + 前缀和求距离和

> **用途**：数轴上 `n` 个点，求所有点对距离之和（或每个点到其余点的距离和）；THU20161E 的多维曼哈顿距离按维独立拆开，逐维用同一套路累加。
>
> **思路**：把坐标排序后，\(a[i]\) 与左边 \(i\) 个点的距离和 \(= a[i] \cdot i - \text{左边坐标前缀和}\)，从左到右扫一遍就把全部点对的距离和数完。排序 \(O(n \log n)\)，扫描 \(O(n)\)。
>
> **输入输出**：输入 `n` 和 `n` 个坐标。输出所有无序点对的距离和。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
const int N = 200010;

int n;
ll a[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> n;
  for (int i = 0; i < n; ++i) cin >> a[i];
  sort(a, a + n);

  ll answer = 0, prefix = 0;
  for (int i = 0; i < n; ++i) {
    // a[i] 与左边 i 个点的距离和 = a[i]*i - 左边所有坐标之和。
    answer += a[i] * i - prefix;
    prefix += a[i];
  }
  cout << answer << '\n';
  return 0;
}
```

> **注意**：必须先排序——距离和是无序对求和，排序不改变答案；`a[i] * i` 及答案都超过 `int`，用 `long long`；多维版本每维独立做一遍再相加。
