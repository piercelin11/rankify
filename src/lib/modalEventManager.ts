import { ReactNode } from "react";

type ModalEventListener = {
    onConfirm?: () => void;
    onCancel?: () => void;
    content?: ReactNode;  // 自訂 modal 的內容
    footer?: ReactNode;   // 自訂 modal 的頁腳
};

// 1. 這個 Map 就是我們的「私有狀態」，它只存在於這個檔案的作用域內。
const listeners: Map<string, ModalEventListener> = new Map();

// 2. 接下來，我們匯出所有操作這個 listeners 的函式。

export function register(modalId: string, listener: ModalEventListener) {
    listeners.set(modalId, listener);
}

export function unregister(modalId: string) {
    listeners.delete(modalId);
}

export function triggerConfirm(modalId: string) {
    const listener = listeners.get(modalId);
    if (listener?.onConfirm) {
        listener.onConfirm();
    }
}

export function triggerCancel(modalId: string) {
    const listener = listeners.get(modalId);
    if (listener?.onCancel) {
        listener.onCancel();
    }
}

export function getContent(modalId: string): ReactNode | undefined {
    const listener = listeners.get(modalId);
    return listener?.content;
}

export function getFooter(modalId: string): ReactNode | undefined {
    const listener = listeners.get(modalId);
    return listener?.footer;
}

export function clear() {
    listeners.clear();
}