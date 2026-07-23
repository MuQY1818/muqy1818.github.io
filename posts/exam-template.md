清华计算机类推免机考（IOI 赛制、开卷纸质资料）C++17 算法模板，原稿为打印版 LaTeX（约 4400 行）。本文为其线上完整版，内容未作删节：STL 速查在前、算法模板在后，每个模板含用途、思路、复杂度与可运行完整程序。

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
