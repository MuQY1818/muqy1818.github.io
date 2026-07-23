> **《清华机考板子》系列**：[总览](post.html?p=tsinghua-exam-cpp-template) · **（一）STL 与选型策略** · [（二）贪心 / DP / 数据结构 / 基础算法](post.html?p=tsinghua-board-2-greedy-ds) · [（三）图论与数学](post.html?p=tsinghua-board-3-graph-math) · [（四）字符串与大模拟](post.html?p=tsinghua-board-4-string-sim)

本篇对应板子 §1–§2，完整收录 C++17/STL 高频用法速查，以及面向清华机考的算法选型与真题策略。

## C++17 与 STL 速查

清华机考的签到题和大模拟很依赖字符串、排序、哈希、队列与多关键字记录。下面只保留 C++17 考场高频写法。

### 完整程序骨架

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using pii = pair<int, int>;

const int N = 100010;
const int INF = 0x3f3f3f3f;

int main() {
  // 加速 C++ 输入输出；开启后不要再混用 scanf/printf。
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  return 0;
}
```

### 输入输出与字符串解析

| 需求 | C++17 写法 |
| --- | --- |
| 多组数据 | `int t; cin >> t; while (t--) { ... }` |
| 读到文件结束 | `while (cin >> x) { ... }` |
| 读取整行 | `getline(cin >> ws, line)` |
| 按空白切分一行 | `stringstream ss(line); while (ss >> x) { ... }` |
| 字符串转整数 | `stoi(s)` / `stoll(s)` |
| 整数转字符串 | `to_string(x)` |
| 设置有效数字 | `cout << setprecision(10) << x` |
| 设置小数位数 | `cout << fixed << setprecision(10) << x` |
| 科学计数法 | `cout << scientific << setprecision(10) << x` |
| 恢复默认格式 | `cout << defaultfloat << setprecision(6)` |
| 前导零或定宽 | `cout << setw(2) << setfill('0') << x` |
| 左右对齐 | `cout << left << setw(10) << x` / `right` |
| 输出进制 | `cout << hex << x` / `oct` / `dec` |
| 输出布尔文本 | `cout << boolalpha << value` / `noboolalpha` |
| 读取单个原始字符 | `cin.get(ch)` |
| 忽略到行末 | `cin.ignore(numeric_limits<streamsize>::max(), '\n')` |
| 判断字符 | `isdigit(ch)` / `isalpha(ch)` / `tolower(ch)` |
| 快速换行 | `cout << answer << '\n'`，不要频繁使用 `endl` |

`setprecision(k)` 单独使用时控制总有效数字；配合 `fixed` 后控制小数点后的位数。例如误差要求为 `1e-6` 时，通常输出 10 位小数：`cout << fixed << setprecision(10) << ans << '\n';`。`fixed` 和精度值都会持续影响后续浮点输出，完整恢复常用默认值可写 `cout << defaultfloat << setprecision(6);`。

`setw` 只影响紧接着的一次输出，`setfill`、对齐方式、进制和浮点格式会持续生效。字符串流可分别使用 `istringstream input(line)` 做解析、`ostringstream output` 拼接文本，或用 `stringstream` 同时读写。

字符串常用操作：

| 需求 | 写法 | 说明 |
| --- | --- | --- |
| 构造重复字符 | `string s(count, ch)` | 如 `string(5, '0')` |
| 长度 / 判空 | `s.size()` / `s.empty()` | `length()` 与 `size()` 相同 |
| 访问字符 | `s[i]` / `s.at(i)` | `at` 越界会抛异常 |
| 首尾字符 | `s.front()` / `s.back()` | 使用前保证非空 |
| 子串 | `s.substr(pos, length)` | `length` 省略时取到末尾 |
| 从左查找 | `s.find(target, pos)` | 失败返回 `string::npos` |
| 从右查找 | `s.rfind(target)` | 返回最后一次出现位置 |
| 查任一字符 | `s.find_first_of(chars)` | 常用于查分隔符 |
| 追加 | `s += other` / `s.append(other)` | 返回当前字符串引用 |
| 追加或删除末尾字符 | `s.push_back(ch)` / `s.pop_back()` | `pop_back` 前保证非空 |
| 插入 | `s.insert(pos, other)` | 在 `pos` 前插入 |
| 删除 | `s.erase(pos, length)` | 也可按迭代器删除 |
| 替换 | `s.replace(pos, length, other)` | 先删区间再插入 |
| 字典序比较 | `s.compare(other)` | 结果小于、等于或大于 0 |
| 清空 | `s.clear()` | 之后 `s.empty()` 为真 |
| C 字符串指针 | `s.c_str()` | 调用 C API 时使用 |
| 反转 / 排序 | `reverse(s.begin(), s.end())` / `sort(s.begin(), s.end())` | 直接修改原串 |

数值转换还可写 `size_t used; long long x = stoll(s, &used, base);`，`used` 表示成功解析的字符数。`starts_with`、`ends_with` 和 `contains` 不是 C++17 接口，现场不要直接使用。

固定格式字符串可以直接切片。输入多组 `HH:MM:SS fps`，输出总帧数：

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int test_count;
  cin >> test_count;
  while (test_count--) {
    string time;
    ll fps;
    cin >> time >> fps;
    // 格式固定为 HH:MM:SS，可直接按位置截取。
    int hour = stoi(time.substr(0, 2));
    int minute = stoi(time.substr(3, 2));
    int second = stoi(time.substr(6, 2));
    // 先统一换成秒；乘法至少有一项使用 long long。
    ll total_seconds = hour * 3600LL + minute * 60LL + second;
    cout << total_seconds * fps << '\n';
  }
  return 0;
}
```

本地调试用文件代替手打样例：把样例粘进 `in.txt`，让程序直接从文件读、向文件写。

- 命令行重定向（代码零改动）：`./a.out < in.txt > out.txt`，再 `diff out.txt answer.txt` 对拍；`time ./a.out < in.txt` 顺便测耗时。
- 代码内 `freopen`：评测机定义了 `ONLINE_JUDGE` 宏，提交后该段自动失效，忘记删也不会挂。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

int main() {
#ifndef ONLINE_JUDGE
  // 本地调试：stdin 改读 in.txt、stdout 改写 out.txt；文件缺失则直接报错退出。
  if (freopen("in.txt", "r", stdin) == nullptr) return 1;
  if (freopen("out.txt", "w", stdout) == nullptr) return 1;
#endif
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  ll sum = 0;
  for (int i = 0; i < n; ++i) {
    ll x;
    cin >> x;
    sum += x;
  }
  cout << sum << '\n';
  return 0;
}
```

`freopen` 生效后 `cin/cout`、`scanf/printf` 全部走文件；Linux 下想恢复控制台输出用 `freopen("/dev/tty", "w", stdout)`。

数据量达到 \(10^6\) 以上时（THU20203A 元数据、THU20161E 距离），关同步的 `cin` 也可能成为瓶颈，手写快读直接从输入缓冲区逐字符拼数字，还能再快一个量级；输出量大时配套手写快写。数据保证非负时可删掉符号处理的三行。

```cpp
#include <bits/stdc++.h>
using namespace std;

using ll = long long;

// 手写快读：直接从输入缓冲区取字符拼数字，比关同步的 cin 再快 5~10 倍。
inline int Read() {
  int value = 0, sign = 1;
  char c = static_cast<char>(getchar());
  while (c < '0' || c > '9') {  // 跳过空白与符号；数据保证非负时可删掉 sign 相关三行
    if (c == '-') sign = -1;
    c = static_cast<char>(getchar());
  }
  while (c >= '0' && c <= '9') {
    value = value * 10 + (c - '0');
    c = static_cast<char>(getchar());
  }
  return value * sign;
}

// 手写快写：把数字逐位拆进缓冲区后一次性输出，配合 '\n' 使用。
inline void Write(ll x) {
  if (x < 0) {
    putchar('-');
    x = -x;
  }
  char buffer[24];
  int top = 0;
  do {
    buffer[top++] = static_cast<char>('0' + x % 10);
    x /= 10;
  } while (x);
  while (top) putchar(buffer[--top]);
}

int main() {
  int n = Read();
  ll sum = 0;
  for (int i = 0; i < n; ++i) sum += Read();
  Write(sum);
  putchar('\n');
  return 0;
}
```

对拍是「先交暴力、再写正解」的安全网：准备数据生成器 `gen.cpp`、暴力 `brute.cpp` 和正解 `sol.cpp`，循环比对两者输出，不一致就停在小数据现场慢慢调。IOI 赛制下每改一版先对拍几十组再提交，比空想调错快得多。

```cpp
// 数据生成器：按正解数据范围随机造小数据，命令行参数作为随机种子。
#include <bits/stdc++.h>
using namespace std;

int main(int, char* argv[]) {
  srand(atoi(argv[1]));  // 对拍循环每轮传不同种子
  int n = rand() % 8 + 1;
  cout << n << '\n';
  for (int i = 0; i < n; ++i) cout << rand() % 20 + 1 << ' ';
  cout << '\n';
  return 0;
}
```

```bash
#!/bin/bash
# 对拍循环：造数据 -> 正解与暴力各跑一遍 -> 比对输出，不一致就留下现场退出。
for ((i = 1; ; ++i)); do
  ./gen "$i" > in.txt
  ./sol < in.txt > out_sol.txt
  ./brute < in.txt > out_brute.txt
  if ! diff -q out_sol.txt out_brute.txt > /dev/null; then
    echo "Mismatch on seed $i, input saved in in.txt"
    break
  fi
  echo "seed $i ok"
done
```

### `pair` 与 `tuple`

| 需求 | 写法 |
| --- | --- |
| 创建二元组 | `pair<int, string> p = {1, "abc"}` |
| 创建 `pair` | `auto p = make_pair(x, y)` |
| 访问 `pair` | `p.first` / `p.second` |
| 创建多元组 | `auto t = make_tuple(id, score, name)` |
| 指定类型 | `tuple<int, int, string> t{id, score, name}` |
| 按下标访问 | `get<0>(t)` / `get<1>(t)` |
| C++17 解包 | `auto [id, score, name] = t` |
| 引用解包 | `auto& [id, score, name] = t` |
| 解包到已有变量 | `tie(id, score, name) = t` |
| 忽略某一项 | `tie(id, ignore, name) = t` |
| 保存引用 | `auto t = make_tuple(ref(x), y)` |
| 拼接元组 | `auto all = tuple_cat(t1, t2)` |
| 元组元素数量 | `tuple_size_v<decltype(t)>` |
| 用元组调用函数 | `apply(function, t)`，C++17 |

`pair` 和 `tuple` 默认按字段从左到右比较，因此适合多关键字排序。`make_tuple` 默认保存值的副本；需要修改原变量时使用 `ref` 或 `tie`。

输入若干条 `name score penalty`，按分数降序、罚时升序、姓名字典序输出：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  vector<tuple<int, int, string>> records;
  for (int i = 0; i < n; ++i) {
    string name;
    int score, penalty;
    cin >> name >> score >> penalty;
    // tuple 默认逐字段升序；分数取负即可得到“分数降序”。
    records.push_back(make_tuple(-score, penalty, name));
  }

  sort(records.begin(), records.end());
  for (const auto& [negative_score, penalty, name] : records) {
    cout << name << ' ' << -negative_score << ' ' << penalty << '\n';
  }
  return 0;
}
```

### 顺序容器

| 容器 | 高频写法 | 适用场景 |
| --- | --- | --- |
| `vector<T>` | `push_back`、`emplace_back`、`pop_back`、`resize`、`clear` | 动态数组，默认首选 |
| `array<T, N>` | `fill(a.begin(), a.end(), value)` | 长度编译期固定 |
| `deque<T>` | `push_front`、`push_back`、`pop_front`、`pop_back` | 两端操作、0-1 BFS |
| `list<T>` | `insert`、`erase`、`splice` | 需要稳定迭代器的双向链表模拟 |
| `string` | `substr`、`find`、`erase`、`insert` | 文本和数字串 |

#### `vector` API

| 需求 | 写法 | 返回值或效果 |
| --- | --- | --- |
| 构造 `n` 个默认值 | `vector<int> v(n)` | 元素初始化为 0 |
| 构造 `n` 个指定值 | `vector<int> v(n, value)` |  |
| 从区间构造 | `vector<int> v(a, a + n)` | 也可传两个迭代器 |
| 二维数组 | `vector<vector<int>> a(n, vector<int>(m, 0))` |  |
| 元素数量 / 判空 | `v.size()` / `v.empty()` |  |
| 容量 | `v.capacity()` | 已分配但未必使用的空间 |
| 下标访问 | `v[i]` / `v.at(i)` | `at` 会检查越界 |
| 首尾元素 | `v.front()` / `v.back()` | 使用前保证非空 |
| 连续内存指针 | `v.data()` | 可传给需要数组指针的函数 |
| 尾部加入 | `v.push_back(x)` / `v.emplace_back(args...)` | `emplace_back` 原地构造 |
| 删除尾部 | `v.pop_back()` | 不返回被删元素 |
| 插入一个元素 | `v.insert(pos, x)` | 返回新元素迭代器 |
| 插入多个元素 | `v.insert(pos, count, x)` | 也可插入迭代器区间 |
| 删除一个元素 | `v.erase(pos)` | 返回被删位置之后的迭代器 |
| 删除一段 | `v.erase(first, last)` | 删除半开区间 `[first, last)` |
| 改变元素数量 | `v.resize(n, value)` | 变大时补值，变小时截断 |
| 预留容量 | `v.reserve(n)` | 不改变 `size()` |
| 整体赋值 | `v.assign(n, value)` | 清空后放入 `n` 个值 |
| 清空 | `v.clear()` | `size()` 变 0，容量通常保留 |
| 交换 | `v.swap(other)` | \(O(1)\) 交换内容 |

删除所有等于 `x` 的元素使用 `v.erase(remove(v.begin(), v.end(), x), v.end());`。`reserve` 只分配内存，不能直接访问新增下标；需要新增元素时用 `resize`。扩容会使全部迭代器、指针和引用失效，插入或删除位置及其后方的迭代器也会失效。

#### `array` API

| 需求 | 写法 |
| --- | --- |
| 零初始化 | `array<int, 5> a{}` |
| 指定初值 | `array<int, 3> a{1, 2, 3}` |
| 大小 / 判空 | `a.size()` / `a.empty()` |
| 访问 | `a[i]`、`a.at(i)`、`a.front()`、`a.back()` |
| 整体填充 | `a.fill(value)` |
| 排序 | `sort(a.begin(), a.end())` |

`array` 长度必须是编译期常量，不能 `push_back` 或 `resize`。

#### `deque` API

| 需求 | 写法 | 复杂度 |
| --- | --- | --- |
| 首尾访问 | `q.front()` / `q.back()` | \(O(1)\) |
| 随机访问 | `q[i]` / `q.at(i)` | \(O(1)\) |
| 首部加入 / 删除 | `q.push_front(x)` / `q.pop_front()` | \(O(1)\) |
| 尾部加入 / 删除 | `q.push_back(x)` / `q.pop_back()` | \(O(1)\) |
| 原地构造 | `q.emplace_front(args...)` / `q.emplace_back(args...)` | \(O(1)\) |
| 中间插入 / 删除 | `q.insert(pos, x)` / `q.erase(pos)` | \(O(n)\) |
| 大小 / 清空 | `q.size()` / `q.empty()` / `q.clear()` |  |

`deque` 适合两端操作，也支持下标访问；但内存不连续，不能把 `&q[0]` 当作普通数组。修改后不要继续使用旧迭代器。

#### `list` API

| 需求 | 写法 | 说明 |
| --- | --- | --- |
| 首尾加入 | `ls.push_front(x)` / `ls.push_back(x)` | \(O(1)\) |
| 指定位置插入 | `ls.insert(pos, x)` / `ls.emplace(pos, args...)` | 返回新元素迭代器 |
| 删除一个 | `it = ls.erase(it)` | 返回下一个迭代器 |
| 删除所有指定值 | `ls.remove(x)` | 成员函数，线性复杂度 |
| 转移节点 | `dst.splice(pos, src, it)` | \(O(1)\)，不复制元素 |
| 排序 / 去重 | `ls.sort()` / `ls.unique()` | `unique` 只删连续重复值 |
| 合并有序链表 | `a.merge(b)` | 两者必须已经有序 |
| 首尾访问 | `ls.front()` / `ls.back()` | 不支持 `ls[i]` |

`list` 插入和删除只会使被删除元素的迭代器失效，适合复杂模拟；但常数和内存开销较大，普通数组题优先使用 `vector`。

### 栈、队列与堆

| 结构 | 定义 | 访问与修改 |
| --- | --- | --- |
| 栈 | `stack<int> st` | `top()`、`push()`、`pop()` |
| 队列 | `queue<int> q` | `front()`、`back()`、`push()`、`pop()` |
| 双端队列 | `deque<int> q` | `front()`、`back()`、两端 `push/pop` |
| 大根堆 | `priority_queue<int> heap` | `top()`、`push()`、`pop()` |
| 小根堆 | `priority_queue<int, vector<int>, greater<int>> heap` | 最小值在 `top()` |
| 二元组小根堆 | `priority_queue<pii, vector<pii>, greater<pii>> heap` | Dijkstra 常用 |

| 需求 | `stack` | `queue` | `priority_queue` |
| --- | --- | --- | --- |
| 判空 / 大小 | `empty()` / `size()` | `empty()` / `size()` | `empty()` / `size()` |
| 读取元素 | `top()` | `front()` / `back()` | `top()` |
| 加入元素 | `push(x)` / `emplace(args...)` | `push(x)` / `emplace(args...)` | `push(x)` / `emplace(args...)` |
| 删除元素 | `pop()` | `pop()` | `pop()` |
| 交换 | `swap(other)` | `swap(other)` | `swap(other)` |

`pop()` 只删除，不返回元素；必须先读取 `top()` 或 `front()`。这些适配器没有迭代器和 `clear()`，清空可写 `stack<int>().swap(st);`、`queue<int>().swap(q);`，堆也可与同类型空对象交换。

从已有区间建堆可写 `priority_queue<int> heap(v.begin(), v.end());`。自定义堆使用 `priority_queue<Node, vector<Node>, Compare>`；`Compare(a, b)` 返回 `true` 表示 `a` 的优先级低于 `b`，因此小根堆比较器通常写成“`a.key > b.key`”。

### 集合、映射与哈希

| 结构 | 特点 | 常用操作 |
| --- | --- | --- |
| `set<T>` | 有序去重，\(O(\log n)\) | `insert`、`erase`、`find`、`lower_bound` |
| `multiset<T>` | 有序且允许重复 | `find` 后按迭代器删除一个 |
| `map<K, V>` | 键有序，\(O(\log n)\) | `mp[key]`、`find`、`lower_bound` |
| `multimap<K, V>` | 键有序且允许重复 | `insert`、`equal_range`，没有 `operator[]` |
| `unordered_set<T>` | 哈希去重，平均 \(O(1)\) | `insert`、`erase`、`find` |
| `unordered_map<K, V>` | 哈希映射，平均 \(O(1)\) | 计数、记录首次位置 |
| `unordered_multiset/multimap` | 哈希且允许重复键 | `count`、`equal_range` |

#### `set` / `multiset` API

| 需求 | 写法 | 返回值或说明 |
| --- | --- | --- |
| 插入去重集合 | `auto [it, inserted] = s.insert(x)` | `inserted` 表示是否新插入 |
| 插入可重集合 | `auto it = ms.insert(x)` | 返回新元素迭代器 |
| 原地构造 | `s.emplace(args...)` | `set` 同样返回迭代器和成功标记 |
| 查找 | `auto it = s.find(x)` | 不存在返回 `s.end()` |
| 读取迭代器 | `int value = *it` | 集合元素不能原地修改 |
| 统计数量 | `s.count(x)` | `set` 为 0/1，`multiset` 可大于 1 |
| 第一个 `>= x` | `s.lower_bound(x)` | \(O(\log n)\) |
| 第一个 `> x` | `s.upper_bound(x)` | \(O(\log n)\) |
| 等值区间 | `auto [l, r] = s.equal_range(x)` | 等价于上下界 |
| 按键删除 | `s.erase(x)` | 返回删除数量；`multiset` 会全删 |
| 按迭代器删除 | `it = s.erase(it)` | 只删一个并返回下一个迭代器 |
| 降序集合 | `set<int, greater<int>> s` | 迭代顺序从大到小 |
| 合并集合 | `a.merge(b)` | C++17，无法转移的重复键留在 `b` |

求前驱：`auto it = s.lower_bound(x); if (it != s.begin()) { --it; }`。求不小于 `x` 的后继直接使用 `lower_bound`。调用成员 `s.lower_bound(x)` 才是 \(O(\log n)\)；对 `set` 使用通用 `lower_bound(s.begin(), s.end(), x)` 虽然比较次数少，但迭代器移动可能是 \(O(n)\)。

#### `map` API

| 需求 | 写法 | 返回值或说明 |
| --- | --- | --- |
| 读写值 | `mp[key]` | 键不存在时插入默认值 |
| 带检查访问 | `mp.at(key)` | 键不存在时抛异常 |
| 插入 | `auto [it, inserted] = mp.insert({key, value})` | 已有键时不覆盖 |
| 原地插入 | `mp.emplace(key, value)` | 已有键时不覆盖 |
| 仅缺失时构造 | `mp.try_emplace(key, args...)` | C++17，避免无用构造 |
| 插入或覆盖 | `mp.insert_or_assign(key, value)` | C++17 |
| 查找但不插入 | `auto it = mp.find(key)` | 不存在返回 `mp.end()` |
| 读取迭代器 | `it->first` / `it->second` | 键不能修改，值可以修改 |
| 判断存在 | `mp.count(key) != 0` | C++17 没有 `contains` |
| 键的上下界 | `mp.lower_bound(key)` / `mp.upper_bound(key)` | 按键有序查找 |
| 删除 | `mp.erase(key)` / `it = mp.erase(it)` | 分别按键或迭代器删除 |
| 遍历 | `for (const auto& [key, value] : mp)` | 默认按键升序 |

`map<pair<int, int>, Value>` 和 `map<tuple<int, int, int>, Value>` 可以直接使用，因为 `pair/tuple` 已定义字典序比较。

#### `unordered_set` / `unordered_map` API

| 需求 | 写法 | 说明 |
| --- | --- | --- |
| 频次统计 | `++count[x]` | `unordered_map<int, int> count` |
| 插入 | `insert` / `emplace` | `unordered_map` 还可用 `try_emplace` |
| 查找 / 计数 | `find(key)` / `count(key)` | 没有上下界操作 |
| 删除 | `erase(key)` / `erase(it)` | 迭代器版本删除一个 |
| 预留元素数 | `mp.reserve(n)` | 大量插入前调用，减少扩容 |
| 调整负载因子 | `mp.max_load_factor(0.7)` | 再配合 `reserve` 使用 |
| 当前负载 | `mp.load_factor()` | 元素数除以桶数 |
| 重建桶 | `mp.rehash(bucket_count)` | 至少使用指定桶数 |

哈希表扩容或 `rehash` 会使全部迭代器失效，但未删除元素的引用和指针仍有效。C++17 没有 `contains`；统一使用 `find` 或 `count`。

`pair` 默认没有标准哈希。输入若干二维坐标并统计不同坐标数量：

```cpp
#include <bits/stdc++.h>
using namespace std;

struct PairHash {
  size_t operator()(const pair<int, int>& point) const {
    // 两个 int 各占 32 位，打包后再交给标准整数哈希。
    uint64_t high = static_cast<uint32_t>(point.first);
    uint64_t low = static_cast<uint32_t>(point.second);
    return hash<uint64_t>{}((high << 32) ^ low);
  }
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  cin >> n;
  unordered_set<pair<int, int>, PairHash> points;
  // 已知元素规模时先预留空间，减少扩容和迭代器失效。
  points.reserve(n * 2);
  while (n--) {
    int x, y;
    cin >> x >> y;
    points.insert({x, y});
  }
  cout << points.size() << '\n';
  return 0;
}
```

同一个哈希器也可用于 `unordered_map<pair<int, int>, Value, PairHash>`。哈希容器遍历顺序不固定，输出需要有序时应先把结果取出排序。

### `<algorithm>` 高频函数

| 需求 | 写法 | 备注 |
| --- | --- | --- |
| 升序排序 | `sort(v.begin(), v.end())` | \(O(n \log n)\) |
| 降序排序 | `sort(v.begin(), v.end(), greater<int>())` |  |
| 稳定排序 | `stable_sort(v.begin(), v.end(), cmp)` | 保留相等元素原顺序 |
| 判断有序 | `is_sorted(v.begin(), v.end())` | 返回 `bool` |
| 第一个 `>= x` | `lower_bound(v.begin(), v.end(), x)` | 序列必须有序 |
| 第一个 `> x` | `upper_bound(v.begin(), v.end(), x)` | 序列必须有序 |
| 是否存在 | `binary_search(v.begin(), v.end(), x)` | 序列必须有序 |
| 等值区间 | `equal_range(v.begin(), v.end(), x)` | 返回上下界迭代器对 |
| 排序去重 | `sort(...); v.erase(unique(v.begin(), v.end()), v.end())` | `unique` 不会缩短容器 |
| 下一个排列 | `next_permutation(v.begin(), v.end())` | 初始序列先升序 |
| 上一个排列 | `prev_permutation(v.begin(), v.end())` | 初始序列先降序可遍历全部 |
| 第 `k` 小 | `nth_element(v.begin(), v.begin() + k, v.end())` | 平均 \(O(n)\)，`k` 从 0 开始 |
| 只排序前 `k` 小 | `partial_sort(v.begin(), v.begin() + k, v.end())` | 前 `k` 项有序 |
| 最大 / 最小位置 | `max_element(...)` / `min_element(...)` | 返回迭代器 |
| 同时求最小最大 | `minmax_element(v.begin(), v.end())` | 返回迭代器对 |
| 限制到区间 | `clamp(x, low, high)` | C++17，返回限制后的值 |
| 计数 / 查找 | `count(...)` / `find(...)` | 线性扫描 |
| 条件计数 / 查找 | `count_if(...)` / `find_if(...)` | 搭配 lambda |
| 反转 / 旋转 | `reverse(...)` / `rotate(first, middle, last)` |  |
| 分区 | `partition(first, last, pred)` | 满足条件的元素移到前面 |
| 删除指定值 | `v.erase(remove(v.begin(), v.end(), x), v.end())` | erase-remove 惯用法 |
| 删除满足条件项 | `v.erase(remove_if(v.begin(), v.end(), pred), v.end())` | C++17 写法 |
| 全部 / 任一 / 全不满足 | `all_of(...)` / `any_of(...)` / `none_of(...)` | 搭配 lambda |
| 复制 | `copy(first, last, back_inserter(dst))` | 目标容器自动尾插 |
| 逐项变换 | `transform(first, last, out, func)` | 输入输出可为同一区间 |
| 填充 / 生成 | `fill(first, last, value)` / `generate(first, last, func)` |  |
| 随机打乱 | `shuffle(v.begin(), v.end(), rng)` | 使用 `mt19937`，不要用已移除的 `random_shuffle` |
| 字典序比较 | `lexicographical_compare(a.begin(), a.end(), b.begin(), b.end())` | 判断 `a < b` |

随机数引擎常用初始化：`mt19937 rng(chrono::steady_clock::now().time_since_epoch().count());`。生成闭区间 `[left, right]` 的随机整数：`uniform_int_distribution<int>(left, right)(rng)`。

两个已经排序的序列可直接使用集合算法：

| 需求 | 写法 |
| --- | --- |
| 归并并保留重复 | `merge(a.begin(), a.end(), b.begin(), b.end(), back_inserter(c))` |
| 并集 | `set_union(a.begin(), a.end(), b.begin(), b.end(), back_inserter(c))` |
| 交集 | `set_intersection(a.begin(), a.end(), b.begin(), b.end(), back_inserter(c))` |
| 差集 `a - b` | `set_difference(a.begin(), a.end(), b.begin(), b.end(), back_inserter(c))` |
| 判断包含 | `includes(a.begin(), a.end(), b.begin(), b.end())` |

`unique` 只删除相邻重复项，通常要先排序。`nth_element` 只保证第 `k` 项就位和两侧分区，不保证两侧有序。自定义排序比较器在两项相等时必须返回 `false`；多关键字排序可优先使用 `tie`：`return tie(a.x, a.y) < tie(b.x, b.y);`。

Lambda 基本形式为 `[capture](parameters) { return expression; }`。`[&]` 按引用捕获外部变量，`[=]` 按值捕获；排序比较器通常不需要捕获，参数使用 `const T&` 避免复制。

### 迭代器与范围

| 需求 | 写法 | 说明 |
| --- | --- | --- |
| 正向范围 | `container.begin()` / `container.end()` | `end()` 指向末尾后一位 |
| 只读范围 | `container.cbegin()` / `container.cend()` | 返回常量迭代器 |
| 反向范围 | `container.rbegin()` / `container.rend()` | 可用于降序排序 `vector` |
| 向后移动 `k` 步 | `next(it, k)` | 返回新迭代器，不修改 `it` |
| 向前移动 `k` 步 | `prev(it, k)` | 需要双向迭代器 |
| 原地移动 | `advance(it, k)` | 修改 `it` 本身 |
| 两迭代器距离 | `distance(first, last)` | `vector` 为 \(O(1)\)，`list/set` 为 \(O(n)\) |
| 尾插输出迭代器 | `back_inserter(v)` | 配合 `copy`、`merge` 等算法 |
| 指定位置插入 | `inserter(s, s.end())` | 适合 `set` 等容器 |
| 只读遍历 | `for (const auto& x : container)` | 避免复制 |
| 修改遍历 | `for (auto& x : container)` | 直接修改元素 |

遍历时删除元素的通用写法是 `it = container.erase(it)`；不删除时再 `++it`。`sort`、`nth_element` 要求随机访问迭代器，只能直接用于数组、`vector`、`deque`；`list` 使用成员函数 `ls.sort()`，`set/map` 本身已经有序。

### 数值、位运算与初始化

| 需求 | 写法 |
| --- | --- |
| 求和 | `accumulate(v.begin(), v.end(), 0LL)` |
| 自定义累加 | `accumulate(first, last, init, func)` |
| 内积 | `inner_product(a.begin(), a.end(), b.begin(), 0LL)` |
| 前缀和 | `partial_sum(v.begin(), v.end(), out.begin())` |
| 相邻差分 | `adjacent_difference(v.begin(), v.end(), out.begin())` |
| 连续赋值 | `iota(v.begin(), v.end(), 0)` |
| 最大公约数 | `gcd(a, b)` |
| 最小公倍数 | `lcm(a, b)` |
| `int` 的 1 个数 | `__builtin_popcount(x)` |
| `long long` 的 1 个数 | `__builtin_popcountll(x)` |
| 末尾 0 个数 | `__builtin_ctz(x)`，要求 `x != 0` |
| `long long` 末尾 0 | `__builtin_ctzll(x)`，要求 `x != 0` |
| 最高位位置 | `31 - __builtin_clz(x)`，要求 `x != 0` |
| 奇偶校验 | `__builtin_parity(x)`，1 的数量为奇数时返回 1 |
| 数组清零 | `memset(a, 0, sizeof a)` |
| 数组置为 -1 | `memset(a, -1, sizeof a)` |
| `int` 正无穷 | `memset(dist, 0x3f, sizeof dist)` |
| 容器填充 | `fill(v.begin(), v.end(), value)` |

`bitset<N>` 高频 API：

| 需求 | 写法 |
| --- | --- |
| 构造 | `bitset<8> bits(value)` / `bitset<8> bits("1010")` |
| 读写第 `i` 位 | `bits[i]` / `bits.test(i)` / `bits.set(i)` / `bits.reset(i)` |
| 全部置 1 / 0 / 翻转 | `bits.set()` / `bits.reset()` / `bits.flip()` |
| 统计 1 | `bits.count()` |
| 是否有 1 / 全 0 / 全 1 | `bits.any()` / `bits.none()` / `bits.all()` |
| 转整数 | `bits.to_ulong()` / `bits.to_ullong()` |
| 位运算 | `a & b`、`a \| b`、`a ^ b`、`~a`、`a << k` |

移位时写 `1LL << bit`，避免 `int` 溢出。`accumulate`、`inner_product` 的初始值决定计算类型，求 `long long` 必须写 `0LL`。乘法可能溢出时，在乘法前转换：`static_cast<__int128>(a) * b`。`memset` 适合按字节重复的 0、-1 和 `0x3f`，不要用它把 `int` 数组设置为任意整数。

### 常见复杂度与坑点

| 操作 | 复杂度 |
| --- | --- |
| `vector` 尾插 | 均摊 \(O(1)\) |
| `vector` 中间插入或删除 | \(O(n)\) |
| `deque` 两端操作 | \(O(1)\) |
| `deque` 中间插入或删除 | \(O(n)\) |
| `list` 已知位置插入或删除 | \(O(1)\) |
| `set/map` 增删查 | \(O(\log n)\) |
| `unordered_set/unordered_map` 增删查 | 平均 \(O(1)\)，最坏 \(O(n)\) |
| 堆的插入和删除堆顶 | \(O(\log n)\) |
| 排序 | \(O(n \log n)\) |
| `lower_bound` 查有序数组 | \(O(\log n)\) |
| `string::find` | 最坏可达 \(O(nm)\) |

> - `lower_bound`、`upper_bound` 和 `binary_search` 使用前必须保证有序。
> - `front/back/top/pop` 使用前先判空，下标访问前检查范围。
> - `vector` 扩容会使全部迭代器和引用失效；插删会影响操作位置及其后方。
> - 遍历容器时删除元素，使用 `it = container.erase(it)`。
> - 下标与 `size()` 比较时注意无符号类型，倒序循环优先使用 `int`。
> - 哈希表不提供有序遍历；需要最小键、前驱或后继时使用 `map/set`。
> - `map[key]` 会插入不存在的键，只判断存在时使用 `find`。
> - C++17 没有容器 `contains` 和通用 `erase_if`，分别使用 `find/count` 和迭代器删除。
> - `remove/unique` 只移动元素，不改变容器长度，最后还要调用 `erase`。
> - `vector<bool>` 返回的是代理对象，不是真正的 `bool&`；需要普通引用语义时改用 `vector<char>`。
> - `priority_queue` 默认是大根堆，小根堆要显式写 `greater<T>`。

网上资料经常混入 C++20/23 API，C++17 考场应使用下面的替代写法：

| 新版本写法 | C++17 替代 |
| --- | --- |
| `container.contains(key)` | `container.find(key) != container.end()` |
| `s.starts_with(prefix)` | `s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0` |
| `s.ends_with(suffix)` | 先判长度，再用 `s.compare(s.size() - suffix.size(), suffix.size(), suffix) == 0` |
| `s.contains(part)` | `s.find(part) != string::npos` |
| `erase_if(v, pred)` | `v.erase(remove_if(v.begin(), v.end(), pred), v.end())` |
| `ranges::sort(v)` | `sort(v.begin(), v.end())` |
| `std::popcount(x)` | `__builtin_popcount(x)` / `__builtin_popcountll(x)` |
| `std::ssize(v)` | `static_cast<int>(v.size())` |

## 算法选型与清华题型

### 清华机考复习优先级

公开真题与经验中，计算机系、网研院常见“签到题 + 大模拟 + 算法题”，软院还会反复考树、背包和矩阵快速幂。现场应优先保证前两题的实现正确率。

| 优先级 | 题目类型 | 必会内容 |
| --- | --- | --- |
| A | 字符串、数组、哈希签到题 | `string`、排序、`tuple`、`map/unordered_map`、固定格式解析 |
| A | 大模拟 | `struct`、队列、方向数组、状态拆分、边界检查 |
| A | 搜索 | DFS、回溯剪枝、BFS、状态去重 |
| A | 图论 | 最短路、拓扑排序、并查集、最小生成树、SCC |
| A | 动态规划 | 背包、线性 DP、区间 DP、树形 DP、状态压缩 |
| B | 数学与大数 | 高精度、质因数分解、欧拉函数、快速幂、矩阵快速幂 |
| B | 数据结构 | 堆、单调结构、树状数组、线段树、Trie |

### 数据范围

| 数据规模 | 常见可接受复杂度 | 常用算法 |
| --- | --- | --- |
| \(n \le 10\) | \(O(n!)\) | 全排列、回溯 |
| \(n \le 20\) | \(O(2^n \cdot n^2)\) | 状态压缩 DP |
| \(n \le 200\) | \(O(n^3)\) | Floyd、区间 DP |
| \(n \le 2{,}000\) | \(O(n^2)\) | LIS、LCS、朴素 DP |
| \(n \le 10^5\) | \(O(n \log n)\) | 排序、二分、树状数组、线段树 |
| \(n \le 10^6\) | \(O(n)\) | 前缀和、双指针、单调结构、筛法 |

### 题型信号

| 看到什么 | 优先想到什么 |
| --- | --- |
| 有序数组查边界、最小可行值 | 二分 |
| 静态区间和 | 前缀和 |
| 多次区间加，最后统一输出 | 差分 |
| 连续区间、左右端点只向前 | 双指针 / 滑动窗口 |
| 动态合并集合、判断连通 | 并查集 |
| 左右第一个更大或更小 | 单调栈 |
| 固定窗口最大值或最小值 | 单调队列 |
| 单点修改、区间和 | 树状数组 |
| 区间修改、区间查询 | 线段树 |
| 无权最短路 | BFS |
| 0/1 边权最短路 | 0-1 BFS |
| 非负权单源最短路 | Dijkstra |
| 负权边或最多经过 `k` 条边 | Bellman-Ford |
| 多源最短路且 `n` 较小 | Floyd |
| 最小代价连通无向图 | Kruskal |
| 有向依赖、课程安排 | 拓扑排序 |
| 每个物品选或不选 | 01 背包 |
| 每个物品可无限选 | 完全背包 |
| 子序列最优值 | 线性 DP |
| 小区间合并成大区间 | 区间 DP |
| 单模式串匹配 | KMP |
| 字符串集合、前缀查询 | Trie |
| 静态网格查询矩形和 | 二维前缀和 |
| 矩形区域多次整体加，最后统一输出 | 二维差分 |
| 分 `k` 段、各段代价之和最值 | 排序 + 分段 DP |
| 轮流操作判先手必胜 | SG 打表、Nim 异或 |
| `n <= 20` 且要枚举「选哪些」 | 状压 + `(s-1)&s` 子集枚举 |
| 点对距离之和 | 排序 + 前缀和 |

### 最短路选择

| 边权 | 算法 | 复杂度 |
| --- | --- | --- |
| 全部相同 | BFS | \(O(n + m)\) |
| 只有 0 和 1 | 0-1 BFS | \(O(n + m)\) |
| 全部非负 | Dijkstra | \(O(m \log n)\) |
| 存在负权 | Bellman-Ford | \(O(nm)\) |
| 任意两点，多次查询 | Floyd | \(O(n^3)\) |

### 大模拟现场写法

大模拟没有通用算法板子，重点是把题意翻译成可检查的状态变化。

1. 先列出实体、状态、事件顺序和终止条件，再开始写代码。
2. 用 `struct` 保存一个实体，用小函数处理一次操作，不把所有分支堆进 `main`。
3. 方向、优先级和事件顺序写成数组或 `enum`，不要散落魔法数字。
4. 每处理一步只修改本步允许变化的状态；需要“同时更新”时先复制旧状态。
5. IOI 赛制先按小数据写直接模拟拿部分分，再替换瓶颈结构。

### 清华 2016–2025 真题统计与保底两题策略

曙梦 OJ 收录 36 道清华机考真题（2016–2025，逐题索引见《清华预推免机考》），按位置统计：

| 位置 | OJ 难度 | 高频考点 | 代表真题 |
| --- | --- | --- | --- |
| T1 签到 | 1–2 | 计数统计、树遍历、排列枚举、快读模拟、矩阵/棋盘模拟 | 众数、出现、元数据、树上计数、毕业照、理发店、拓扑分析、拼花 |
| T2 中档 | 2–4 | 大模拟、数据结构、DP、期望 | 五子棋、水滴、飞镖、售货机、军训队列、动态众数、幻彩气球 |
| T3 压轴 | 5–9 | 表达式解析、矩阵树定理、状压 DP、线段树、博弈、拉格朗日插值 | 表达式求值、连通图方案数、Phi 的游戏、遍历平滑性、乐园亲子问答 |

考场执行顺序：

1. 开考 10 分钟通读全部题目。T1 通常是纯计数或短模拟（§6.6、§7.11、§1.2），30 分钟内必须 AC。
2. T2 多为大模拟：先按 §2.5 列实体、状态与事件顺序，参照 §10 五子棋的组织方式写；小样例测过就交一版保底，再回头优化。
3. T3 直接写暴力（枚举、DFS、朴素 DP）交小数据测试点。IOI 赛制按测试点给分，暴力常拿 20–40 分。
4. 每题限 32 次有效提交、多次提交按测试点取最高分，放心逐版迭代，不要攒到最后一次性提交。
