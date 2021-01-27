import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import * as bsIcon from "react-icons/bs";
import firebase from "../firebase";
import styled from "styled-components";
const { SubMenu } = Menu;
export const BlackBg = styled.div`
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  display: none;
  @media all and (max-width: 640px) {
    &.on {
      display: block;
    }
  }
`;
function Nav() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [current, setCurrent] = useState("1");

  const handleClick = (e) => {
    setCurrent(e.key);
  };

  const [LeftMenu, setLeftMenu] = useState(false);
  const onMenuHandler = () => {
    setLeftMenu(!LeftMenu);
  };

  const onLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <>
      {!LeftMenu && (
        <bsIcon.BsList className="btn-m-menu" onClick={onMenuHandler} />
      )}
      {LeftMenu && (
        <bsIcon.BsX className="btn-m-close" onClick={onMenuHandler} />
      )}
      <div className={"left-nav-menu " + (LeftMenu && "on")}>
        <div className="nav-top-box">
          {!currentUser && (
            <>
              <Link to="/login">login</Link>
              <Link to="/join">join</Link>
            </>
          )}
          {currentUser && (
            <>
              <div className="flex-box j-center">
                {currentUser.displayName}님 반갑습니다.
                <span
                  onClick={onLogout}
                  style={{
                    color: "#1890ff",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  logout
                </span>
              </div>
            </>
          )}
        </div>
        <Menu
          theme={"light"}
          onClick={handleClick}
          defaultOpenKeys={["sub1"]}
          selectedKeys={[current]}
          mode="inline"
        >
          <Menu.Item key="1">
            <Link to="/">메뉴판</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/myorder">주문내역</Link>
          </Menu.Item>
          <SubMenu key="sub1" title="관리자">
            <Menu.Item key="3">
              <Link to="/admin/prod">상품관리</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/admin/order">주문관리</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/admin/order_list">완료내역</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
      <BlackBg className={LeftMenu && "on"} onClick={onMenuHandler} />
    </>
  );
}
export default Nav;
