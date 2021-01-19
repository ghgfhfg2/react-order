import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Switch } from "antd";
const { SubMenu } = Menu;

function Nav() {
  const [theme, setTheme] = useState("dark");
  const changeTheme = (value) => {
    value ? setTheme("dark") : setTheme("light");
  };

  const [current, setCurrent] = useState("1");

  const handleClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <>
      <Switch
        checked={theme === "dark"}
        onChange={changeTheme}
        checkedChildren="Dark"
        unCheckedChildren="Light"
      />
      <Menu
        theme={theme}
        onClick={handleClick}
        style={{ width: 256 }}
        defaultOpenKeys={["sub1"]}
        selectedKeys={[current]}
        mode="inline"
      >
        <SubMenu key="sub1" title="Navigation One">
          <Menu.Item key="1">Option 1</Menu.Item>
          <Menu.Item key="2">Option 2</Menu.Item>
          <Menu.Item key="3">Option 3</Menu.Item>
          <Menu.Item key="4">Option 4</Menu.Item>
        </SubMenu>
      </Menu>
      <div>
        <Link to="/">home</Link>
        <Link to="/join">join</Link>
      </div>
    </>
  );
}
export default Nav;
