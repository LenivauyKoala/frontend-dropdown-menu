"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

type MenuPosition = {
  top: string;
  left: string;
};

type MenuType = "top-left" | "top-center" | "top-right" | null;

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isPositionCalculated, setIsPositionCalculated] =
    useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const topLeftButtonRef = useRef<HTMLButtonElement | null>(null);
  const topCenterButtonRef = useRef<HTMLButtonElement | null>(null);
  const topRightButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = (menuType: MenuType): void => {
    if (activeMenu === menuType) {
      // Если кликаем на уже активное меню - закрываем его
      closeMenu();
    } else {
      // Если кликаем на другое меню - закрываем текущее и открываем новое
      if (!activeMenu) {
        setIsPositionCalculated(false);
      }
      setActiveMenu(menuType);
    }
  };

  const closeMenu = (): void => {
    setActiveMenu(null);
    setMenuPosition(null);
    setIsPositionCalculated(false);
  };

  // Колбэки для пунктов меню
  const handleOpen = (): void => {
    console.log("Выполняется действие: Открыть");
    closeMenu();
  };

  const handleSave = (): void => {
    console.log("Выполняется действие: Сохранить");
    closeMenu();
  };

  const handleDelete = (): void => {
    console.log("Выполняется действие: Удалить");
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      let clickedOutside = true;

      if (menuRef.current?.contains(event.target as Node)) {
        clickedOutside = false;
      }

      if (topLeftButtonRef.current?.contains(event.target as Node)) {
        clickedOutside = false;
      }

      if (topCenterButtonRef.current?.contains(event.target as Node)) {
        clickedOutside = false;
      }

      if (topRightButtonRef.current?.contains(event.target as Node)) {
        clickedOutside = false;
      }

      if (clickedOutside) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Улучшенное позиционирование меню
  useEffect(() => {
    if (!activeMenu) return;

    const calculatePosition = (): void => {
      let button: HTMLButtonElement | null = null;

      switch (activeMenu) {
        case "top-left":
          button = topLeftButtonRef.current;
          break;
        case "top-center":
          button = topCenterButtonRef.current;
          break;
        case "top-right":
          button = topRightButtonRef.current;
          break;
      }

      if (!button) return;

      const buttonRect = button.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Создаем временный элемент для измерения реальных размеров меню
      const tempMenu = document.createElement("div");
      tempMenu.className = styles.contextMenu;
      tempMenu.style.visibility = "hidden";
      tempMenu.style.position = "fixed";
      tempMenu.style.top = "0";
      tempMenu.style.left = "0";

      // Добавляем содержимое меню
      tempMenu.innerHTML = `
        <div class="${styles.menuItem}">Открыть</div>
        <div class="${styles.menuItem}">Сохранить</div>
        <div class="${styles.menuItem}">Удалить</div>
      `;

      document.body.appendChild(tempMenu);

      // Получаем реальные размеры меню
      const menuRect = tempMenu.getBoundingClientRect();
      const menuWidth = menuRect.width;
      const menuHeight = menuRect.height;

      // Удаляем временный элемент
      document.body.removeChild(tempMenu);

      // Рассчитываем доступное пространство
      const spaceRight = viewportWidth - buttonRect.right;
      const spaceLeft = buttonRect.left;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Определяем горизонтальное позиционирование
      let left: number;
      if (spaceRight >= menuWidth || spaceRight >= spaceLeft) {
        // Открываем справа от кнопки
        left = buttonRect.right;
      } else {
        // Открываем слева от кнопки
        left = buttonRect.left - menuWidth;
      }

      // Определяем вертикальное позиционирование
      let top: number;
      if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
        // Открываем снизу от кнопки
        top = buttonRect.bottom;
      } else {
        // Открываем сверху от кнопки
        top = buttonRect.top - menuHeight;
      }

      // Добавляем небольшой отступ от кнопки
      const OFFSET = 5;

      if (left === buttonRect.right) {
        left += OFFSET; // справа от кнопки
      } else {
        left -= OFFSET; // слева от кнопки
      }

      if (top === buttonRect.bottom) {
        top += OFFSET; // снизу от кнопки
      } else {
        top -= OFFSET; // сверху от кнопки
      }

      // Корректируем границы - не даем выйти за пределы экрана
      left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));
      top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));

      setMenuPosition({
        top: `${top}px`,
        left: `${left}px`,
      });
      setIsPositionCalculated(true);
    };

    calculatePosition();
  }, [activeMenu]);

  return (
    <div className={styles.container}>
      {/* Кнопка меню - слева вверху */}
      <button
        ref={topLeftButtonRef}
        onClick={() => toggleMenu("top-left")}
        className={styles.menuButton}
        style={{ top: "20px", left: "20px" }}
      >
        ☰
      </button>

      {/* Кнопка меню - по центру вверху */}
      <button
        ref={topCenterButtonRef}
        onClick={() => toggleMenu("top-center")}
        className={styles.menuButton}
        style={{ top: "20px", left: "50%", transform: "translateX(-50%)" }}
      >
        ☰
      </button>

      {/* Кнопка меню - справа вверху */}
      <button
        ref={topRightButtonRef}
        onClick={() => toggleMenu("top-right")}
        className={styles.menuButton}
        style={{ top: "20px", right: "20px" }}
      >
        ☰
      </button>

      {/* Контекстное меню */}
      {activeMenu && isPositionCalculated && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={menuPosition || {}}
        >
          <div className={styles.menuItem} onClick={handleOpen}>
            Открыть
          </div>
          <div className={styles.menuItem} onClick={handleSave}>
            Сохранить
          </div>
          <div className={styles.menuItem} onClick={handleDelete}>
            Удалить
          </div>
        </div>
      )}
    </div>
  );
}
