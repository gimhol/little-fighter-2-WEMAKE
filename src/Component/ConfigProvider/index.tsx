import React, { createContext, useContext, useMemo } from "react";
import type { TVariant } from "../StyleBase/Variant";
import type { UiSize } from "../Text";

// ============================================================
// Types
// ============================================================

export interface Config {
  /** 组件默认尺寸 */
  size?: UiSize;
  /** 组件默认变体（边框、圆角、阴影等） */
  variants?: TVariant[] | string;
  /** CSS 类名前缀，用于定制样式命名空间 */
  prefixCls?: string;
  /** 弹出层挂载节点，默认挂载到 body */
  getPopupContainer?: () => HTMLElement;
  /** 是否禁用全局动画 */
  disableAnim?: boolean;
}

const defaultConfig: Required<Config> = {
  size: "m",
  variants: [],
  prefixCls: "lfui",
  getPopupContainer: () => document.body,
  disableAnim: false,
};

// ============================================================
// Context
// ============================================================

const ConfigContext = createContext<Required<Config>>(defaultConfig);

// ============================================================
// Hook
// ============================================================

/**
 * 获取当前 ConfigProvider 提供的全局配置。
 * 组件内部可通过此 hook 获取默认 size、variants 等，再与自身 props 合并。
 *
 * @example
 * ```tsx
 * const { size: globalSize, variants: globalVariants } = useConfig();
 * // props 优先，未传则回退到全局配置
 * const finalSize = props.size ?? globalSize;
 * ```
 */
export function useConfig(): Required<Config> {
  return useContext(ConfigContext);
}

// ============================================================
// Provider Component
// ============================================================

export interface ConfigProviderProps {
  /** 全局配置，会与父级 ConfigProvider 的配置深度合并 */
  config?: Partial<Config>;
  /** 子节点 */
  children?: React.ReactNode;
}

/**
 * 全局配置提供者，类似 antd 的 ConfigProvider。
 *
 * 支持嵌套：内层 Provider 会与父级配置合并，未设置的字段继承父级。
 *
 * @example
 * ```tsx
 * // 根级别设置
 * <ConfigProvider config={{ size: 's', prefixCls: 'myapp' }}>
 *   <App />
 * </ConfigProvider>
 *
 * // 局部覆盖
 * <ConfigProvider config={{ size: 'l' }}>
 *   <LargeSection />
 * </ConfigProvider>
 * ```
 */
export function ConfigProvider({ config, children }: ConfigProviderProps) {
  const parentConfig = useContext(ConfigContext);

  const merged = useMemo<Required<Config>>(() => {
    if (!config) return parentConfig;
    return {
      ...parentConfig,
      ...config,
      // 深度合并嵌套对象（为未来扩展预留）
      getPopupContainer:
        config.getPopupContainer ?? parentConfig.getPopupContainer,
    };
  }, [parentConfig, config]);

  return (
    <ConfigContext.Provider value={merged}>{children}</ConfigContext.Provider>
  );
}

// ============================================================
// Utility: merge config with local props
// ============================================================

/**
 * 从 useConfig() 与组件自身 props 中合并出最终值。
 * 组件 props 优先级高于全局配置。
 */
export function useMergedConfig<
  P extends { size?: UiSize; variants?: TVariant[] | string },
>(props: P) {
  const global = useConfig();
  return useMemo(
    () => ({
      size: props.size ?? global.size,
      variants: props.variants ?? global.variants,
    }),
    [props.size, props.variants, global.size, global.variants],
  );
}
