import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";

const ExcalidrawWrapper = forwardRef((props, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    useImperativeHandle(ref, () => ({
        updateScene: (sceneData) => {
            if (excalidrawAPI) {
                excalidrawAPI.updateScene(sceneData);
            }
        },
        getSceneElements: () => {
            return excalidrawAPI ? excalidrawAPI.getSceneElements() : [];
        },
        getAppState: () => {
            return excalidrawAPI ? excalidrawAPI.getAppState() : null;
        },
        addElements: (elements) => {
            if (!excalidrawAPI) return;
            const currentElements = excalidrawAPI.getSceneElements();
            excalidrawAPI.updateScene({
                elements: [...currentElements, ...convertToExcalidrawElements(elements)]
            });
        }
    }));

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                initialData={props.initialData}
            />
        </div>
    );
});

// Global export for Blazor to call
window.mountExcalidraw = (containerId, dotnetRef) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const root = createRoot(container);
    const ref = React.createRef();

    root.render(<ExcalidrawWrapper ref={ref} />);

    // Store the ref globally or attached to the container for later access
    // For simplicity, we'll store it in a map using the containerId
    window.excalidrawInstances = window.excalidrawInstances || {};
    window.excalidrawInstances[containerId] = ref;
};

window.updateExcalidrawScene = (containerId, sceneData) => {
    const ref = window.excalidrawInstances?.[containerId];
    if (ref && ref.current) {
        ref.current.updateScene(sceneData);
    }
};

window.addExcalidrawElements = (containerId, elements) => {
    const ref = window.excalidrawInstances?.[containerId];
    if (ref && ref.current) {
        ref.current.addElements(elements);
    }
}
