---
title: "UTF-8 in C++ on Windows"
date: 2025-10-05
description: "Why your C++ program prints strange symbols on Windows terminals, and how UTF-8, ASCII, and code pages affect text output across platforms."
---

# UTF-8 in C++ on Windows

If you've ever written something like this in C++:

```cpp
#include <iostream>

int main()
{
    std::cout << "ö" << std::endl; // or any other UTF-8 text
}
```

and instead of a nice `ö` you get garbage like:

```
├╢
```

…then welcome to the classic **Windows console codepage problem**.

This post explains why it happens, what *codepages* and *encodings* have to do with it, how C++ treats string literals internally, and how to fix it properly on Windows (without breaking Linux or macOS).

## 1. The Problem: "My UTF-8 text prints as garbage"

When you run your program on Linux or macOS, everything looks fine.
But on Windows, the same program prints nonsense characters like:

```
├╢
```

or

```
Ã¶
```

This is not your fault! Your program is probably correct.

What's wrong is **how the Windows console interprets your output bytes**.

## 2. What's actually happening

Let's unpack what's going on step by step.

### Step 1: Your C++ code

```cpp
std::cout << "ö";
```

This writes two bytes to standard output:
`0xC3 0xB6`, which is the UTF-8 encoding of the Unicode character **U+00F6** (`ö`).

C++ doesn't care about encoding; it just writes bytes.

### Step 2: The console reads those bytes

When the bytes reach your console (Command Prompt or Windows Terminal), the console tries to **interpret** them using its current *code page*, a legacy system of 8-bit character mappings from the DOS era.

If the console is set to **CP437** (the U.S. OEM code page) or **CP1252** (the Windows Latin-1 code page), the two bytes `C3 B6` do *not* mean `ö`. They map to box-drawing symbols instead. That's why you see:

```
├╢
```

Your bytes are correct! They're just being misread.

### Step 3: On Linux and macOS

Linux and macOS terminals default to **UTF-8 locales**, so those same bytes (`C3 B6`) are interpreted as Unicode `ö`. Everything looks perfect there.

## 3. Understanding Windows code pages

A **code page** is an old 8-bit encoding system.
Before Unicode, each region used a different code page:

* CP437 - US OEM
* CP850 - Western Europe
* CP1252 - Windows Latin-1
* CP932 - Japanese Shift-JIS

Windows consoles still use these legacy mappings by default.
UTF-8 is also available as **code page 65001**, but not enabled by default (unless you change settings).

That's why your UTF-8 output doesn't render correctly.

## 4. The proper fix: Use UTF-8 everywhere

The modern, portable encoding is **UTF-8**.
UTF-8 can represent every Unicode character using one to four bytes and is compatible with ASCII.

C++ doesn't care what encoding you use. It just moves bytes around, so your job is to make sure both the *compiler* and *runtime environment* agree that those bytes are UTF-8.

Let's handle both cases.

### Step 1: Ensure your source file is UTF-8

Make sure your `.cpp` files are saved in UTF-8.

In Visual Studio:

1. File -> Save As -> (arrow on Save button) -> **Save with Encoding…**
2. Select **UTF-8 (without BOM)**

In VS Code:

* Look at the bottom bar (encoding indicator).
* Change it to **UTF-8** and save.

### Step 2: Tell MSVC to compile as UTF-8

Add `/utf-8` to your compile options.

In Visual Studio:

* Project -> Properties -> C/C++ -> Command Line -> Additional Options -> `/utf-8`

In CMake:

```cmake
add_compile_options("$<$<CXX_COMPILER_ID:MSVC>:/utf-8>")
```

In Premake:

```lua
filter "system:windows"
    buildoptions { "/utf-8" }
```

This ensures that:

* Your source is read as UTF-8.
* Your execution character set is UTF-8.

Now your literals like `"ö"` are stored as the correct UTF-8 bytes.

### Step 3: Tell the Windows console to use UTF-8

There are **three ways** to make the Windows console interpret UTF-8 correctly.

#### Option 1: Manually switch code page

Run before your program:

```cmd
chcp 65001
your_program.exe
```

This temporarily switches the console to UTF-8.
However, it's user-side and easy to forget.

#### Option 2: Set the code page in your program

You can programmatically request UTF-8 output:

```cpp
#include <windows.h> // for SetConsoleOutputCP
#include <iostream>

int main()
{
    // Tell the console to use UTF-8 for output
    SetConsoleOutputCP(CP_UTF8);

    std::cout << "ö" << std::endl;
}
```

Now your program works correctly even on systems that haven't been configured for UTF-8. This means it can handle international characters, special symbols, and non-English text without crashing or producing garbage output.

If you want to be tidy:

```cpp
UINT old_cp = GetConsoleOutputCP();
SetConsoleOutputCP(CP_UTF8);

// print UTF-8 text
std::cout << "Svenska bokstäver: åäö\n";

SetConsoleOutputCP(old_cp); // restore original code page
```

#### Option 3: Use Windows Terminal or PowerShell Core

The new Windows Terminal and PowerShell (`>=7`) are UTF-8 aware by default.
If you're using those, you don't need `SetConsoleOutputCP`, it already works.

### Step 4: Optional - enable UTF-8 system-wide

On Windows 10+ you can go to:

* Settings -> Time & Language -> Administrative language settings
* Change system locale
* Use Unicode UTF-8 for worldwide language support

This changes the "ANSI" code page for all apps to UTF-8 (65001).
Then even legacy applications will run with UTF-8 encoding.

> :warning: **Warning:** Some older software assumes CP1252 or Shift-JIS, so this can cause subtle issues.
> Use it if you live fully in UTF-8 world (modern editors, modern apps).

## 5. Why not just use `wchar_t`?

You *can* print Unicode on Windows using wide characters:

```cpp
#include <io.h>
#include <fcntl.h>
#include <iostream>

int main()
{
    _setmode(_fileno(stdout), _O_U16TEXT);
    std::wcout << L"ö" << std::endl;
}
```

This writes UTF-16 directly to the console.
It bypasses the code page mess, but it's Windows-only and not portable.
For cross-platform code, UTF-8 is the better choice.

## 6. What about writing to files or ImGui?

Files, sockets, and libraries like Dear ImGui already assume UTF-8.
You don't need `SetConsoleOutputCP` for them. The bytes are already correct.
This problem only affects **console output** on Windows.

## 7. Summary

| Environment      | Default Encoding | Output of `"ö"` | Fix                              |
| ---------------- | ---------------- | --------------- | -------------------------------- |
| Linux/macOS      | UTF-8            | ✅ Works         | None                             |
| Windows CMD      | CP437 / CP1252   | ❌ "├╢"          | `SetConsoleOutputCP(CP_UTF8)`    |
| Windows Terminal | UTF-8            | ✅ Works         | None                             |
| PowerShell Core  | UTF-8            | ✅ Works         | None                             |
| Legacy apps      | Various          | ❌               | `Beta: Use UTF-8` system setting |

## 8. The takeaway

If your C++ program prints weird symbols instead of proper Unicode characters on Windows:

* **Your code is fine.**
* The **console** is misinterpreting UTF-8 bytes.
* Fix it by:

  1. Saving source files as UTF-8.
  2. Compiling with `/utf-8`.
  3. Calling `SetConsoleOutputCP(CP_UTF8)` at startup (or using Windows Terminal).

Then your output will display beautifully across Windows, Linux, and macOS. No garbage symbols, no confusion, just correct Unicode everywhere.

### Quick cross-platform helper

You can safely drop this function into your code:

```cpp
void enable_utf8_console()
{
#ifdef _WIN32
    #include <windows.h>
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif
}
```

Call it at the beginning of `main()`:

```cpp
int main()
{
    enable_utf8_console();
    std::cout << "Svenska tecken: å, ä, ö\n";
}
```

## My thoughts

I wrote this post because I was genuinely frustrated by the same problem.

At first, I thought something was wrong with the **fmt** library or the way C++ handles UTF-8.

I had already enabled the `/utf-8` compiler option in MSVC, so I assumed everything in my C++ project should handle UTF-8 text correctly. Yet, when I printed something as simple as `"ö"` to the console, it came out as unreadable garbage.

What made it even more confusing was that **Windows Terminal** could display "ö" perfectly when I typed it directly. But **Visual Studio's Debug Console** showed nonsense symbols instead. There were no clear options in the Terminal app or Visual Studio to fix the behavior, so for a while I was convinced the issue was somewhere inside **fmt** or just quirks of C++ on Windows.

After digging through countless posts, I came across a few people suggesting the use of:

```cpp
SetConsoleOutputCP(CP_UTF8);
```

I tried it and it worked. Finally, the characters printed correctly.

But this only made me more confused: Why was this not the default behavior on modern Windows? Why do I need to manually tell the console to speak UTF-8 in 2026?

Later, I discovered another suggestion online. Enabling the **Use Unicode UTF-8 for worldwide language support** option under the Windows system locale settings. The text even said "*Beta*", which made it feel experimental, but it worked flawlessly once enabled. From that point on, all console output displayed correctly, even without extra code.

Honestly, I'm baffled that this isn't on by default yet. Windows 10 and 11 already handle UTF-8 well across most modern applications, so the console lagging behind feels unnecessary.

I decided to write this article because I know many developers have probably hit the same wall. Your code is correct, your compiler is correct, but your output still looks broken.

If you're in that seat right now, I've been there too. Hopefully, this post helps you understand what's going on and gets your console to display text the way it should.
