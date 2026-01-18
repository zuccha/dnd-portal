import { createRef, useLayoutEffect, useRef, useState } from "react";
import { dropLast } from "../ui/array";

//------------------------------------------------------------------------------
// Use Paginated Content
//------------------------------------------------------------------------------

export default function usePaginatedContent(
  content: string,
  onPageCountChange: (count: number | undefined) => void,
) {
  const changePageCountRef = useRef(onPageCountChange);
  const contentRef = useRef("");
  const renderCountRef = useRef(0);

  const [pages, setPages] = useState<
    {
      ref: React.RefObject<HTMLDivElement | null>;
      text: string;
      textTemp: string;
    }[]
  >([{ ref: createRef<HTMLDivElement>(), text: "", textTemp: "" }]);

  useLayoutEffect(() => {
    changePageCountRef.current = onPageCountChange;
  }, [onPageCountChange]);

  useLayoutEffect(() => {
    changePageCountRef.current(undefined);
    contentRef.current = content;
    setPages([{ ref: createRef<HTMLDivElement>(), text: "", textTemp: "" }]);
  }, [content]);

  useLayoutEffect(() => {
    if (renderCountRef.current > 45) {
      renderCountRef.current = 0;
      requestAnimationFrame(() => setPages([...pages]));
      return;
    }

    renderCountRef.current++;

    const lastPage = pages[pages.length - 1]!;
    const element = lastPage.ref.current;
    if (!element) return changePageCountRef.current(undefined);
    const overflow = element.scrollHeight > element.clientHeight;

    if (overflow) {
      // We need to split the text we are trying to fit in the page in two.
      // If the page already has some text that fits, we don't need to do a
      // hard split. Otherwise, a big, unbreakable word needs to be split even
      // if it doesn't contain any spaces. On the first page, never hard split
      // as there is other stuff that can cause an overflow.
      const hardSplit = !lastPage.text && pages.length > 1;
      let [left, right] = split(lastPage.textTemp, hardSplit);
      if (!left) [left, right] = [right, ""];

      if (!left && !contentRef.current)
        return changePageCountRef.current(pages.length);

      if (right) {
        setPages([...dropLast(pages), { ...lastPage, textTemp: left }]);
        contentRef.current = right + contentRef.current;
      } else {
        const textTemp = lastPage.textTemp + contentRef.current;
        setPages([
          ...dropLast(pages),
          { ...lastPage, textTemp: "" },
          { ref: createRef(), text: "", textTemp },
        ]);
        contentRef.current = "";
      }
    } else if (contentRef.current.length) {
      setPages([
        ...dropLast(pages),
        {
          ...lastPage,
          text: lastPage.text + lastPage.textTemp,
          textTemp: contentRef.current,
        },
      ]);
      contentRef.current = "";
    } else {
      changePageCountRef.current(pages.length);
    }
  }, [pages]);

  return pages;
}

//------------------------------------------------------------------------------
// Split
//------------------------------------------------------------------------------

function split(text: string, hardSplit: boolean): [string, string] {
  const center = Math.ceil(text.length / 2);
  let left = center - 1;
  let right = center;
  while (0 <= left || right < text.length) {
    if (/[ \t\n]/.test(text[right] ?? ""))
      return [text.slice(0, right), text.slice(right)];
    if (/[ \t\n]/.test(text[left] ?? ""))
      return [text.slice(0, left), text.slice(left)];
    left--;
    right++;
  }
  return hardSplit ? [text.slice(0, center), text.slice(center)] : [text, ""];
}
