import { KeyboardEvent, useRef } from "react";

type Props = {
  input: HTMLInputElement;
  options: string[];
};

export const useAutocomplete = ({ input, options }: Props) => {
  const ulClasses =
    "autocomplete-ul flex flex-col liElements-center absolute top-full w-full bg-violet-100 max-h-[700%] overflow-scroll";
  const liClasses =
    "outline-0 cursor-pointer p-1 border-b border-violet-200 w-full text-center hover:bg-violet-50 focus:bg-violet-50";

  const focusIndex = useRef<number>(-1);
  const liElements = useRef<HTMLElement[]>([]);

  function autocomplete() {
    const searchedText = input.value;
    closeAutocomplete();
    const ul = document.createElement("UL");
    ul.classList.add(...ulClasses.split(" "));
    input.parentNode?.appendChild(ul);
    addEventToUl(ul);

    for (const option of options) {
      if (option.includes(searchedText)) {
        const li = document.createElement("LI");
        li.classList.add(...liClasses.split(" "));
        const indexOfSearchedText = option.indexOf(searchedText);
        li.innerHTML = option.slice(0, indexOfSearchedText);
        li.innerHTML += `<b>${searchedText}</b>`;
        li.innerHTML += option.slice(indexOfSearchedText + searchedText.length);
        ul.appendChild(li);
        liElements.current.push(li);
        addEventsToLi(li);
      }
    }
  }

  document.addEventListener("click", () => {
    closeAutocomplete();
  });

  function addEventsToLi(li: HTMLElement) {
    li.addEventListener("click", () => {
      saveValue(li);
    });
  }

  function saveValue(li: HTMLElement) {
    input.value = li.innerText;
    closeAutocomplete();
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "ArrowDown":
        if (focusIndex.current < liElements.current.length - 1) {
          focusIndex.current += 1;
          focusLi(liElements.current, focusIndex.current);
        } else focusInput();
        break;
      case "ArrowUp":
        if (focusIndex.current > 0) {
          focusIndex.current -= 1;
          focusLi(liElements.current, focusIndex.current);
        } else focusInput();
        break;
      case "Enter":
        e.preventDefault();
        if (document.activeElement instanceof HTMLLIElement)
          saveValue(document.activeElement);
        break;
      default:
    }
  };

  function addEventToUl(ul: HTMLElement) {
    ul.parentElement?.addEventListener("keydown", handleKeyDown);
  }

  function focusLi(items: HTMLElement[], index: number) {
    for (let i = 0; i < items.length; i++) {
      const li = items[i];
      if (i === index) {
        li.setAttribute("tabIndex", "-1");
        (li as HTMLElement).focus();
      } else {
        li.removeAttribute("tabIndex");
      }
    }
  }

  function focusInput() {
    focusIndex.current = -1;
    input?.focus();
  }

  function closeAutocomplete() {
    const autocompletes = document.getElementsByClassName("autocomplete-ul");
    for (const a of autocompletes) {
      a.parentNode?.removeChild(a);
    }
    focusIndex.current = -1;
    liElements.current = [];
  }

  return { autocomplete };
};
