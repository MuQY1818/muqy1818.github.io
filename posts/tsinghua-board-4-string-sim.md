> **《清华机考板子》系列**：[总览](post.html?p=tsinghua-exam-cpp-template) · [（一）STL 与选型策略](post.html?p=tsinghua-board-1-stl) · [（二）贪心 / DP / 数据结构 / 基础算法](post.html?p=tsinghua-board-2-greedy-ds) · [（三）图论与数学](post.html?p=tsinghua-board-3-graph-math) · **（四）字符串与大模拟**

本篇对应板子 §9–§11，完整收录字符串算法模板、大模拟完整范例（五子棋）与提交前检查清单。

## 字符串

### KMP

> **用途**：在文本串中查找模式串的全部出现位置。
>
> **思路**：匹配到一半断了，朴素做法是把模式串退回开头重新比。KMP 事先给模式串每个位置算好「断了以后该退到哪接着比」（最长相等前后缀），失配只回退模式串指针，文本指针一路向前绝不回头。复杂度 \(O(n + m)\)。
>
> **输入输出**：输入模式串和文本串，输出所有匹配起点的 0-based 下标。

*图：模式串 `a b a b a c`（下标 0–5）的失配回跳示意：已匹配 abab 后失配，最长相等前后缀 ab（长度 2）继续对齐，文本指针不动，\(j \gets \mathrm{next}[j-1]=2\)。*

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 1000010;
char pattern[N], text[N];
// prefix_function[i]：pattern[1..i] 的最长相等真前后缀长度。
int prefix_function[N];

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  cin >> (pattern + 1) >> (text + 1);
  int m = strlen(pattern + 1);
  int n = strlen(text + 1);

  // j 始终表示当前已经匹配的模式串前缀长度。
  for (int i = 2, j = 0; i <= m; ++i) {
    while (j && pattern[i] != pattern[j + 1]) j = prefix_function[j];
    if (pattern[i] == pattern[j + 1]) ++j;
    prefix_function[i] = j;
  }

  for (int i = 1, j = 0; i <= n; ++i) {
    while (j && text[i] != pattern[j + 1]) j = prefix_function[j];
    if (text[i] == pattern[j + 1]) ++j;
    if (j == m) {
      cout << i - m << ' ';
      // 匹配成功后继续回退，可找到相互重叠的匹配。
      j = prefix_function[j];
    }
  }
  cout << '\n';
  return 0;
}
```

### Trie 字典树

> **用途**：维护字符串集合，查询完整字符串或前缀。
>
> **思路**：把单词挂成一棵树：从根往下每走一条边拼出一个字符，前缀相同的单词共用同一段路径。插入和查询都逐字符向下走，边不存在时插入就新建、查询就返回 0；只有走完整个单词的终点节点才计数，所以查 `app` 不会误中 `apple`。复杂度与处理的字符串总长度成正比。
>
> **输入输出**：输入操作数 `m`；`I word` 插入，`Q word` 查询。仅处理小写字母。

*图：插入 abc、abd、bd 构成的 Trie；红底节点 = 单词结尾标记。*

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 500010;
// 0 号节点是根；child[u][c] 是字符边，word_count 只统计完整单词。
int child[N][26], word_count[N], node_count;

void Insert(const string& word) {
  int node = 0;
  for (char ch : word) {
    int c = ch - 'a';
    // child 为 0 表示边不存在，新节点编号从 1 开始。
    if (!child[node][c]) child[node][c] = ++node_count;
    node = child[node][c];
  }
  ++word_count[node];
}

int Query(const string& word) {
  int node = 0;
  for (char ch : word) {
    int c = ch - 'a';
    if (!child[node][c]) return 0;
    node = child[node][c];
  }
  return word_count[node];
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int m;
  cin >> m;
  while (m--) {
    char op;
    string word;
    cin >> op >> word;
    if (op == 'I') {
      Insert(word);
    } else {
      cout << Query(word) << '\n';
    }
  }
  return 0;
}
```

### 字符串哈希

> **用途**：同一字符串上反复判断两个子串是否相等。
>
> **思路**：给每个子串发一个「指纹」：把字符串按 131 进制凑成一个大数，指纹相同就当子串相等，省得逐字符比较。前缀哈希像前缀和一样两个相减就得到任意一段的指纹，`unsigned long long` 自然溢出相当于免费取模。预处理 \(O(n)\)，查询 \(O(1)\)。
>
> **输入输出**：输入字符串、查询数 `q`，每次给出两个 1-based 闭区间。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ull = unsigned long long;
const int N = 1000010;
const ull BASE = 131;

char text[N];
// hash_value[i] 是前 i 个字符的哈希；power_base[i] = BASE^i。
ull hash_value[N], power_base[N];

ull GetHash(int left, int right) {
  // unsigned long long 自然溢出，相当于对 2^64 取模。
  return hash_value[right] -
         hash_value[left - 1] * power_base[right - left + 1];
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int q;
  cin >> (text + 1) >> q;
  int n = strlen(text + 1);
  power_base[0] = 1;
  for (int i = 1; i <= n; ++i) {
    power_base[i] = power_base[i - 1] * BASE;
    hash_value[i] = hash_value[i - 1] * BASE + text[i];
  }

  while (q--) {
    int l1, r1, l2, r2;
    cin >> l1 >> r1 >> l2 >> r2;
    bool same_length = r1 - l1 == r2 - l2;
    cout << (same_length && GetHash(l1, r1) == GetHash(l2, r2)
                 ? "Yes"
                 : "No")
         << '\n';
  }
  return 0;
}
```

哈希存在极低概率冲突。必须保证确定性正确时使用双哈希或其他字符串算法。

### 01 Trie：最大异或对

> **用途**：从整数集合中找两个数，使异或值最大。
>
> **思路**：把每个数按 31 位二进制插进一棵每层只有 0/1 两条边的 Trie；查 `x` 的最佳搭档时从最高位往下走，每层优先选与 `x` 相反的位，让异或结果的高位尽量为 1。高位对数值的贡献远大于低位，所以这种逐位贪心就是最优；相反位不存在时才被迫走相同位。复杂度 \(O(31n)\)。
>
> **输入输出**：输入 `n` 个非负 `int`，输出最大异或值。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
const int M = N * 31;
// 每个整数使用 31 个节点层，0 号节点是根。
int child[M][2], node_count;

void Insert(int value) {
  int node = 0;
  for (int bit = 30; bit >= 0; --bit) {
    int current = value >> bit & 1;
    if (!child[node][current]) child[node][current] = ++node_count;
    node = child[node][current];
  }
}

int Query(int value) {
  int node = 0;
  int answer = 0;
  for (int bit = 30; bit >= 0; --bit) {
    int current = value >> bit & 1;
    // 从高位到低位优先选择相反位，使当前异或位为 1。
    int wanted = current ^ 1;
    if (child[node][wanted]) {
      answer |= 1 << bit;
      node = child[node][wanted];
    } else {
      node = child[node][current];
    }
  }
  return answer;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  int answer = 0;
  for (int i = 0; i < n; ++i) {
    int x;
    cin >> x;
    if (i) answer = max(answer, Query(x));
    Insert(x);
  }
  cout << answer << '\n';
  return 0;
}
```

### 表达式求值（双栈）

> **用途**：求只含非负整数、`+ - * /` 和括号的表达式的值，支持一元负号（THU20161C 表达式类、软院常考）。
>
> **思路**：两个栈分工：数字进数栈，符号进符栈。新进一个符号时，若符栈栈顶的优先级不比它低（比如栈顶是乘号、新来的是加号），就先把栈顶算掉，保证乘除永远先于加减；遇到右括号就一路结算到左括号。开头或 `(` 后的 `-` 是一元负号，前面补个 `0` 就变成二元减。复杂度 \(O(n)\)。
>
> **输入输出**：输入一行表达式（无空格），输出一个整数（`long long`，整数除法向零取整）。

*图：双栈中间状态——操作数栈（栈顶在上）自顶向下为 3、2、1；运算符栈栈顶为 `*`、下方为 `+`；栈顶 `*` 优先于 `+`，先结算。*

上图：处理 `1+2*3` 时两栈的中间状态——操作数栈已压入 1、2、3，运算符栈栈顶为 `*`，优先级高于下方的 `+`，故弹出栈顶先结算乘法。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  string s;
  cin >> s;                             // 一行表达式，无空格

  // 一元负号补 0：开头或 '(' 后的 '-' 视为 0 减
  string t;
  for (int i = 0; i < (int)s.size(); ++i) {
    if (s[i] == '-' && (i == 0 || s[i - 1] == '(')) t += '0';
    t += s[i];
  }

  unordered_map<char, int> pri{{'+', 1}, {'-', 1}, {'*', 2}, {'/', 2}};
  vector<ll> num;                       // 操作数栈
  vector<char> op;                      // 运算符栈
  auto Calc = [&]() {                   // 弹出栈顶运算符结算一次
    ll rhs = num.back(); num.pop_back();
    ll lhs = num.back(); num.pop_back();
    char c = op.back(); op.pop_back();
    ll r = 0;
    if (c == '+') r = lhs + rhs;
    else if (c == '-') r = lhs - rhs;
    else if (c == '*') r = lhs * rhs;
    else r = lhs / rhs;                 // C++ 整数除法天然向零取整
    num.push_back(r);
  };

  for (int i = 0; i < (int)t.size(); ++i) {
    if (isdigit(t[i])) {
      ll v = 0;
      while (i < (int)t.size() && isdigit(t[i])) v = v * 10 + (t[i++] - '0');
      --i;                              // 补偿 for 循环的 ++i
      num.push_back(v);
    } else if (t[i] == '(') {
      op.push_back('(');
    } else if (t[i] == ')') {
      while (op.back() != '(') Calc();  // 结算到左括号
      op.pop_back();
    } else {
      // 栈顶优先级不低于当前则先结算，保证左结合
      while (!op.empty() && op.back() != '(' && pri[op.back()] >= pri[t[i]]) {
        Calc();
      }
      op.push_back(t[i]);
    }
  }
  while (!op.empty()) Calc();
  cout << num.back() << '\n';
  return 0;
}
```

> **易错点**：多位数解析后要 `--i` 补偿循环自增；结算前先判运算符栈非空且栈顶不是 `(`；中间结果可为负（如 `0-5*3`），全程用 `long long`。

## 大模拟范例：五子棋

> **用途**：清华 T2 大模拟范本（THU20162B），覆盖棋盘方向数组、逐步落子、连子判定等高频套路。
>
> **思路**：胜负一定由最新落下的那枚棋子促成，所以每步只以新落子为中心，沿横、竖和两条斜线共 4 个方向（方向数组 `(0,1),(1,0),(1,1),(1,-1)`）向两侧数同色连子，含自己满 5 个即胜。判胜立即输出当前步数并结束程序，保证取到最早结束步；棋盘用 \(17 \times 17\) 数组，0=空、1=A 黑、2=B 白。复杂度 \(O(n \times \text{方向数} \times \text{连子长度})\)，`n <= 225` 可忽略。
>
> **输入输出**：第一行 `n`（`0 <= n <= 225`）；以下 `n` 行每行 `x y`（`1 <= x,y <= 15`）为第 `i` 步落子位置，奇数步 A（黑先手）、偶数步 B（白）。某方在同行、同列或 45\(^\circ\) 斜线（两个方向）上连续 5 子及以上即胜，输出 `A w` 或 `B w`（字母与数字间一个空格，`w` 为最早结束步）；始终无人胜输出 `Tie`。

*图：7×7 棋盘，中心黑子为新落子，沿水平、竖直与两条对角线共 4 个方向作双向计数；双向计数 \(\ge 5\) 即胜。*

上图：从新落子（中心黑子）出发，沿水平、竖直与两条对角线共 4 个方向双向数同色连子，任一方向合计 \(\ge 5\) 即胜。

```cpp
#include <bits/stdc++.h>
using namespace std;

// 4 个方向数组：水平、竖直、主对角线、副对角线
const int kDx[4] = {0, 1, 1, 1};
const int kDy[4] = {1, 0, 1, -1};

int board[17][17];  // 棋盘：0=空，1=A（黑），2=B（白），下标 1~15

// 从新落子 (x, y) 出发，沿方向 d 双向统计连续同色棋子总数（含自身）
int CountLine(int x, int y, int d, int color) {
  int total = 1;
  for (int sign = -1; sign <= 1; sign += 2) {  // sign 取 -1/+1，正反两个方向各数一遍
    int nx = x + sign * kDx[d];
    int ny = y + sign * kDy[d];
    // 不变量：(nx, ny) 指向下一个待检查格；必须先判边界再访问棋盘
    while (nx >= 1 && nx <= 15 && ny >= 1 && ny <= 15 &&
           board[nx][ny] == color) {
      ++total;
      nx += sign * kDx[d];
      ny += sign * kDy[d];
    }
  }
  return total;
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  for (int step = 1; step <= n; ++step) {
    int x, y;
    cin >> x >> y;
    int color = (step % 2 == 1) ? 1 : 2;  // 奇数步 A 执黑，偶数步 B 执白
    board[x][y] = color;  // 先落子，再判胜
    // 只有新落子可能产生新的五连，故每步只需从 (x, y) 检查 4 个方向
    for (int d = 0; d < 4; ++d) {
      if (CountLine(x, y, d, color) >= 5) {
        cout << (color == 1 ? 'A' : 'B') << ' ' << step << '\n';
        return 0;  // 最早结束步即答案，直接结束程序
      }
    }
  }
  cout << "Tie\n";
  return 0;
}
```

> **易错点**：先落子再判胜，且只需从新落子点向两侧检查——旧局面若已有五连，棋局早在那一步就该结束；双向计数时必须先做 \(1 \sim 15\) 边界检查再访问棋盘，防止越界；一旦发现胜利立即输出当前步数并结束程序，答案取最早结束步，不要被序列后续步覆盖（如样例在 20 步序列中第 17 步即应判 A 胜）。

## 提交前检查

- 先确认 0-based 还是 1-based，检查 `n = 0/1` 和区间端点。
- 乘法、距离、前缀和、方案数、最小生成树权值优先使用 `long long`。
- 无向图加两个方向；Dijkstra 不能有负权；Kruskal 检查是否选满 `n - 1` 条边。
- `INF + weight` 前先判断可达，避免溢出。
- 多组测试清空数组、邻接表、队列、堆和全局计数器。
- 自定义排序比较器相等时必须返回 `false`。
- 链状树递归深度可能达到 \(O(n)\)，必要时改成迭代写法。
- 输入规模达到 \(10^6\) 时改用手写快读，输出量大时加手写快写（§1.2）。
- 换算法后先与旧版暴力对拍（§1.2），输出一致再提交新版本。
- 提交前至少手测：最小规模、全相等、严格递增、严格递减、不连通和答案不存在。
