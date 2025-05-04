import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

export default function DropdownPortal({ anchorRef, show, children, alignRight }) {
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    useEffect(() => {
    if (show && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPos({
        top: rect.bottom + window.scrollY,
        left: alignRight ? (rect.right + window.scrollX - 192) : (rect.left + window.scrollX), // 192px là width dropdown
        width: rect.width
        });
    }
    }, [show, anchorRef, alignRight]);
    if (!show) return null;
    return ReactDOM.createPortal(
        <div style={{ position: 'absolute', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}>
            {children}
        </div>,
        document.body
    );
}