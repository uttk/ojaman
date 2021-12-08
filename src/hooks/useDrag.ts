import { useEffect, useRef } from "preact/hooks";

export const useDrag = () => {
  const mouseRef = useRef({ x: 0, y: 0 }).current;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      const ele = ref.current;

      if (!ele) return;

      mouseRef.x = 0;
      mouseRef.y = 0;

      ele.style.top = "16px";
      ele.style.right = "16px";
      ele.style.left = "unset";
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const moveElements = (event: MouseEvent) => {
    if (!ref.current) return;

    const ele = ref.current;
    const { clientY, clientX } = event;

    ele.style.cursor = "grabbing";
    ele.style.right = "unset";
    ele.style.top = `${clientY - mouseRef.y}px`;
    ele.style.left = `${clientX - mouseRef.x}px`;
  };

  const onMouseDown = (event: MouseEvent) => {
    if (!ref.current) return;

    const ele = ref.current;
    const { left: x, top: y } = ele.getBoundingClientRect();

    mouseRef.x = event.clientX - x;
    mouseRef.y = event.clientY - y;

    moveElements(event);

    const clearMouseEvent = () => {
      ele.style.cursor = "grab";
      window.removeEventListener("mousemove", moveElements);
      window.removeEventListener("mouseup", clearMouseEvent);
    };

    window.addEventListener("mousemove", moveElements);
    window.addEventListener("mouseup", clearMouseEvent);
  };

  return { ref, onMouseDown };
};
