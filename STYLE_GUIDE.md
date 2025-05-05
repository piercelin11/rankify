## 間距 (Spacing)
說明如何應用 Tailwind 的間距刻度，以及不同情境下常用的間距「等級」範例。

- **應用範例：**

  - **元件內部 Padding：**
    - 按鈕內部 padding：通常使用 `px-4 py-2` 或 `px-5 py-2.5`。
    - 卡片內部 padding：常用 `p-4` 或響應式 `p-4 sm:p-6`。
  - **元件之間 Margin / Grid Gap：**
    - 列表項目間距：常用 `space-y-3` 或 `space-y-4`。
    - 表單元素間距：常用 `mb-4`。
    - Grid 佈局間距：常用 `gap-4` 或 `gap-6`。
  - **區塊/ Section 間距：**
    - 頁面主要區塊之間的垂直間距：常用 `mb-8` 或 `mb-12`。
    - 容器左右內邊距：常用 `px-4 sm:px-6 lg:px-8`。

- **原則：** 相同類型或層級的間距應該盡量保持一致，從 Tailwind 刻度中選擇最接近視覺需求的尺寸。



## 文字排版 (Typography)
定義專案中使用的字體、文字層級及其樣式。

- **字體家族 (Font Family):**
  - 主要字體: [字體名稱 1] (`font-sans`)
  - 次要字體: [字體名稱 2] (`font-serif` 或 `font-mono`)

- **文字層級:**

    - **Display** 
    - **H1** 
    - **H2**
    - **H3**
    - **H4**
    - **Hilight**
    - **Description**
    - **Caption**



## 顏色
darkMode: 'class', // 啟用深淺模式
  theme: {
    extend: {
      colors: {
        // 定義你的語義化顏色
        primary: colors.blue, // 將 primary 映射到 Tailwind 的藍色色板
        secondary: colors.purple, // 將 secondary 映射到 Tailwind 的紫色色板
        neutral: colors.neutral, // 將 neutral 映射到 Tailwind 的 neutral 色板 (作為灰階)
        // 或者定義自定義顏色和色板
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          // ... 定義更多深淺變化，通常涵蓋 50 到 900/950
          500: '#ef4444', // 例如，這是一個紅色系
          // ...
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // 狀態色 (Status Colors)
        success: colors.green,
        warning: colors.yellow,
        danger: colors.red, // 用 danger 或 error 都可以
        info: colors.sky, // 用 sky 或 teal 都可以
      },
    },
  },