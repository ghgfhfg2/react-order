import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import * as bsIcon from "react-icons/bs";
import * as antIcon from "react-icons/ai";
import firebase from "../firebase";
import styled from "styled-components";
import moment from "moment";
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
    setLeftMenu(!LeftMenu);
  };

  const [LeftMenu, setLeftMenu] = useState(false);
  const onMenuHandler = () => {
    setLeftMenu(!LeftMenu);
  };

  const onLogout = () => {
    firebase.auth().signOut();
  };
  
  
  const timeDiff = (time) => {
    let hour = parseInt(time.split(':')[0] * 60);
    let min = parseInt(time.split(':')[1]);
    return hour + min;
  }
  
  const [AbleTime, setAbleTime] = useState();
  const [CurAbleTime, setCurAbleTime] = useState(0);
  const [TimeChange, setTimeChange] = useState(false);
  const timeRef = useRef(false);

  useEffect(() => {          
    setTimeout(() => {
      timeRef.current = !timeRef.current;      
      setTimeChange(timeRef.current);
    }, 2000);
    const currentDay = moment().format('dddd');
    const currentTime = moment().format('HH:mm');
    const currentTimeNum = timeDiff(currentTime);
    let mounted = true;
    if (mounted) {
      firebase
      .database()
      .ref("time")
      .on("value", (snapshot) => {
        setAbleTime(snapshot.val());
        let able = snapshot.val();
        let ableKeys = Object.keys(able);
        let newAble = {}
        for (let i = 0; i < ableKeys.length; i++) {
          const key = ableKeys[i]
          const value = able[key]
          newAble[key] = timeDiff(value);
        }
        if(currentTimeNum >= newAble.ableTimeStart && currentTimeNum <= newAble.ableTimeEnd){
          setCurAbleTime(1);
          if(currentTimeNum >= newAble.disableTimeStart && currentTimeNum < newAble.disableTimeEnd){
            setCurAbleTime(2);
          }
          if(currentTimeNum >= newAble.lunchTimeStart && currentTimeNum < newAble.lunchTimeEnd){
            setCurAbleTime(3);
          }
          if(currentTimeNum >= newAble.breakTimeStart && currentTimeNum <= newAble.breakTimeEnd){
            setCurAbleTime(4);
          }
        }else{
          setCurAbleTime(0)
        }    
        if(currentDay == '토요일' || currentDay == '일요일'){
          setCurAbleTime(5)
        }    
      });
      
    }
    return () => {
      mounted = false;
    }
  }, [TimeChange])

  if (currentUser) {
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
                <Link to="/login" onClick={onMenuHandler}>
                  login
                </Link>
                <Link to="/join" onClick={onMenuHandler}>
                  join
                </Link>
              </>
            )}
            {currentUser && (
              <>
                <div className="flex-box j-center">
                  {currentUser.displayName}님 반갑습니다.
                  <span
                    onClick={onLogout}
                    className="p-color-l"
                    style={{
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
              <Link to="/">
                <antIcon.AiOutlineCoffee />
                메뉴판
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/myorder">
                <antIcon.AiOutlineOrderedList />
                주문내역
              </Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/mymenu">
                <antIcon.AiOutlineStar />
                마이메뉴
              </Link>
            </Menu.Item>
            {currentUser.uid === "xMIQkuZuh5S7lTjwsBnkcbLi5kF3" && (
              <SubMenu
                key="sub1"
                title="관리자"
                icon={<antIcon.AiOutlineSetting />}
              >
                <Menu.Item key="4">
                  <Link to="/admin/prod">
                    <antIcon.AiOutlineAppstoreAdd />
                    상품관리
                  </Link>
                </Menu.Item>
                <Menu.Item key="5">
                  <Link to="/admin/order">
                    <antIcon.AiOutlineAlert />
                    주문관리
                  </Link>
                </Menu.Item>
                <Menu.Item key="6">
                  <Link to="/admin/order_list">
                    <antIcon.AiOutlineFileDone />
                    완료내역
                  </Link>
                </Menu.Item>
              </SubMenu>
            )}
            {AbleTime && CurAbleTime && (
            <li className="nav-time">
                <span className={"current"+" state_"+CurAbleTime}>
                  <span>Now</span>
                </span>
                <ul>
                  <li className={CurAbleTime === 1 ? "cur" : ""}><span>운영시간</span> - {AbleTime.ableTimeStart}~{AbleTime.ableTimeEnd}</li>
                  <li className={CurAbleTime === 2 ? "cur" : ""}><span>이용불가</span> - {AbleTime.disableTimeStart}~{AbleTime.disableTimeEnd}</li>
                  <li className={CurAbleTime === 3 ? "cur" : ""}><span>점심시간</span> - {AbleTime.lunchTimeStart}~{AbleTime.lunchTimeEnd}</li>
                  <li className={CurAbleTime === 4 ? "cur" : ""}><span>브레이크</span> - {AbleTime.breakTimeStart}~{AbleTime.breakTimeEnd}</li>
                </ul>
            </li>
            )}
          </Menu>          
        </div>
        <BlackBg className={LeftMenu && "on"} onClick={onMenuHandler} />
      </>
    );
  } else {
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
                <Link to="/login" onClick={onMenuHandler}>
                  login
                </Link>
                <Link to="/join" onClick={onMenuHandler}>
                  join
                </Link>
              </>
            )}
            {currentUser && (
              <>
                <div className="flex-box j-center">
                  {currentUser.displayName}님 반갑습니다.
                  <span 
                    class="p-color-l"
                    onClick={onLogout}
                    style={{
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
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              비회원 사용불가
            </div>
          </Menu>
          <BlackBg className={LeftMenu && "on"} onClick={onMenuHandler} />
        </div>
      </>
    );
  }
}
export default Nav;
