import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";

function Nav() {
  const [current, setCurrent] = useState("1");

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <>
      <div className="nav-top-box">
        <Link to="/login">login</Link>
        <Link to="/join">join</Link>
      </div>
      <Menu
        theme={"light"}
        onClick={handleClick}
        className="left-nav-menu"
        defaultOpenKeys={["sub1"]}
        selectedKeys={[current]}
        mode="inline"
      >
        <Menu.Item key="1">메뉴판</Menu.Item>
        <Menu.Item key="2">장바구니</Menu.Item>
      </Menu>
    </>
  );
}
export default Nav;
