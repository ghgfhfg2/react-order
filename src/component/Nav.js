import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, Input, Button } from "antd";
import * as bsIcon from "react-icons/bs";
import * as antIcon from "react-icons/ai";
import firebase from "../firebase";
import styled from "styled-components";
import moment from "moment";
import { OderModalPopup } from "./OrderModal";
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
  @media all and (max-width: 760px) {
    &.on {
      display: block;
    }
  }
`;
function Nav() { 


  const firebaseUserInfo = firebase.auth().currentUser;
  let name, email, photoUrl, uid, emailVerified;
  if (firebaseUserInfo != null) {
    name = firebaseUserInfo.displayName;
    email = firebaseUserInfo.email;
    photoUrl = firebaseUserInfo.photoURL;
    emailVerified = firebaseUserInfo.emailVerified;
    uid = firebaseUserInfo.uid; 
  }

  const currentUser = useSelector((state) => state.user.currentUser);

  const [current, setCurrent] = useState("1");

  const handleClick = (e) => {
    setCurrent(e.key);
    setLeftMenu(!LeftMenu);
  };

  const [InfoPop, setInfoPop] = useState(false)
  const onChangeInfo = () => {
    setInfoPop(!InfoPop);
  }

  const [LeftMenu, setLeftMenu] = useState(false);
  const onMenuHandler = () => {
    setInfoPop(false);
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

  const [UserDb, setUserDb] = useState();
  
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
      if(currentUser){  
        firebase
        .database()
        .ref("users")
        .child(currentUser.uid)
        .on("value", (snapshot) => {
          setUserDb(snapshot.val());
        });
      }
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
        if(currentTimeNum >= newAble.ableTimeStart && currentTimeNum < newAble.ableTimeEnd){
          setCurAbleTime(1);
          if(currentTimeNum >= newAble.disableTimeStart && currentTimeNum < newAble.disableTimeEnd){
            setCurAbleTime(2);
          }
          if(currentTimeNum >= newAble.lunchTimeStart && currentTimeNum < newAble.lunchTimeEnd){
            setCurAbleTime(3);
          }
          if(currentTimeNum >= newAble.breakTimeStart && currentTimeNum < newAble.breakTimeEnd){
            setCurAbleTime(4);
          }
        }else{
          setCurAbleTime(5)
        }    
        if(currentDay == '토요일' || currentDay == '일요일'){
          setCurAbleTime(5)
        }    
      });

    }
    return function cleanup() {
      firebase.database().ref("users").off();
      firebase.database().ref("time").off();
      mounted = false;
    };
  }, [TimeChange])

  const [submitLoading, setsubmitLoading] = useState(false);
  const onSubmitInfo = async (e) => {
    
    e.preventDefault();
    let sosok = e.target.sosok.value;
    let part = e.target.part.value;

    firebaseUserInfo.updateProfile({
      photoURL:e.target.part.value
    })
    let call_num = e.target.call_number.value;
    if(isNaN(call_num)){
      alert('숫자만 입력해 주세요');
      return;
    }
    if(call_num.length != 11){
      alert('올바른 번호가 아닙니다');
      return;
    }
    setsubmitLoading(true);
    try{
      let user = firebase.auth().currentUser;
      user.updateProfile({
        phoneNumber: "01055278712"
      }).then(function() {
        alert('업데이트 되었습니다.');
      }).catch(function(error) {
        console.error(error);
      });  
      await firebase
      .database()
      .ref("users")
      .child(currentUser.uid)
      .update({
        call_number: call_num,
        part: part,
        sosok: sosok
      })
      setInfoPop(false)
    }catch (error) {
      console.error(error);
    }
    setsubmitLoading(false);
  }

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
                {InfoPop && UserDb &&
                  <OderModalPopup className="call_modify" style={{
                    top:"180px",
                    left:"155px",
                    position:"absolute",
                  }}>
                    <form className="order-form-box" onSubmit={onSubmitInfo}>
                      <div className="input-box" style={{marginBottom:"5px"}}>
                        <span className="tit">이메일</span>
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="input-box" style={{marginBottom:"5px"}}>
                        <span className="tit">소속</span>
                        <select
                          name="sosok"
                          defaultValue={UserDb.sosok}
                        >
                          <option value="">
                            소속선택
                          </option>
                          <option value="1">미트리</option>
                          <option value="2">푸드킹</option>
                          <option value="3">계약직</option>
                        </select>
                      </div>
                      <div className="input-box" style={{marginBottom:"5px"}}>
                        <span className="tit">부서</span>
                        <select
                          name="part"
                          defaultValue={photoUrl}
                        >
                          <option value="photoUrl" disabled hidden>
                            부서
                          </option>
                          <option value="R&D">R&D</option>
                          <option value="전략기획부">전략기획부</option>
                          <option value="영업지원부">영업지원부</option>
                          <option value="인사재경부">인사재경부</option>
                          <option value="IT개발부">IT개발부</option>
                          <option value="푸드킹">푸드킹</option>
                          <option value="물류부">물류부</option>
                        </select>
                      </div>
                      <div className="input-box" style={{marginBottom:"5px"}}>
                      <span className="tit">휴대전화</span>
                        <Input name="call_number" defaultValue={UserDb.call_number} style={{marginRight:"5px"}}></Input>
                        <Button
                          disabled={submitLoading}
                          htmlType="submit"
                          type="primary"
                        >수정</Button>
                      </div>
                      <span>'-'이나 공백없이 숫자만 입력해 주세요.</span>
                    </form>
                  </OderModalPopup>
                }
                <div className="flex-box j-center">
                  <span className="p-color-l"
                    onClick={onChangeInfo}
                    style={{
                      cursor: "pointer",
                      fontWeight: "500",
                      marginLeft: "10px",
                    }}
                  >
                    {currentUser.displayName}
                  </span>
                  님 반갑습니다.                  
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
            <Menu.Item key="7">
              <Link to="/lunch">
                <antIcon.AiOutlineDownSquare />
                식단체크
              </Link>
            </Menu.Item>
            {UserDb && UserDb.auth && UserDb.auth.includes('insa') && 
            <Menu.Item key="9">
              <Link to="/research">
                <antIcon.AiOutlineFileDone />
                설문조사
              </Link>
            </Menu.Item>
            }
            {UserDb && UserDb.auth && UserDb.auth.includes('insa') && 
            <Menu.Item key="10">
              <Link to="/hair">
                <antIcon.AiOutlineScissor />
                헤어
              </Link>
            </Menu.Item>
            }
           
            {UserDb && UserDb.role > 0 &&
            (
              <SubMenu
                key="sub1"
                title="관리자"
                icon={<antIcon.AiOutlineSetting />}
              >       
                {
                  UserDb && UserDb.auth && UserDb.auth.includes('insa') &&
                  <Menu.Item key="11">
                    <Link to="/admin/hair">
                      <antIcon.AiOutlineAppstoreAdd />
                      헤어관리
                    </Link>
                  </Menu.Item>  
                }          
                {UserDb.role > 1 &&
                  <>
                    <Menu.Item key="8">
                      <Link to="/admin/lunch">
                        <antIcon.AiOutlineAppstoreAdd />
                        식단관리
                      </Link>
                    </Menu.Item>                
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
                  </>
                }
                {UserDb.role > 2 &&
                <Menu.Item key="0">
                  <Link to="/admin/user_admin">
                    <antIcon.AiOutlineTeam />
                    회원관리
                  </Link>
                </Menu.Item>
                }
              </SubMenu>
            )}
            {AbleTime && CurAbleTime && (
            <li className="nav-time">
                <span className={"current"+" state_"+CurAbleTime}>
                  <span>Now</span>
                </span>
                <ul>
                  {AbleTime.ableTimeStart &&
                  <li className={CurAbleTime === 1 ? "cur" : ""}><span>운영시간</span> - {AbleTime.ableTimeStart}~{AbleTime.ableTimeEnd}</li>
                  }
                  {AbleTime.disableTimeStart &&
                  <li className={CurAbleTime === 2 ? "cur" : ""}><span>이용불가</span> - {AbleTime.disableTimeStart}~{AbleTime.disableTimeEnd}</li>
                  }
                  {AbleTime.lunchTimeStart &&
                  <li className={CurAbleTime === 3 ? "cur" : ""}><span>점심시간</span> - {AbleTime.lunchTimeStart}~{AbleTime.lunchTimeEnd}</li>
                  }
                  {AbleTime.breakTimeStart &&
                  <li className={CurAbleTime === 4 ? "cur" : ""}><span>브레이크</span> - {AbleTime.breakTimeStart}~{AbleTime.breakTimeEnd}</li>
                  }
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
