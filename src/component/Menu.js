import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber,getFormatDate } from "./CommonFunc";
import Loading from "./Loading";
import { Radio, Input, Empty } from "antd";
import * as antIcon from "react-icons/ai";
import * as Hangul from "hangul-js";
import { useSelector } from "react-redux";
const { Search } = Input;
const _ = require("lodash");

const curDate = getFormatDate(new Date());
function Menu() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ProdItem, setProdItem] = useState([]);
  const [ProdItemCopy, setProdItemCopy] = useState();



  //정렬 라디오버튼
  const [CateRadio, setCateRadio] = useState("all");
  const itemSort = (e) => {
    setCateRadio(e.target.value);
  };

  //검색
  const [searchInput, setSearchInput] = useState("");
  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
    if(e.target.value === ''){
      setSearchAgain(!SearchAgain);
    }
  };

  const [SearchAgain, setSearchAgain] = useState(false);
  const onSearch = () => {
    setSearchAgain(!SearchAgain);
  };

  const onToggleFavor = (e, name) => {
    e.currentTarget.classList.toggle("true");
    firebase
      .database()
      .ref("users")
      .child(userInfo.uid)
      .child(`favorite/${name}/add_favor`)
      .transaction((pre) => {
        return !pre;
      });
  };

  let b_soldout;
  let m_soldout;
  let m_soldout2;

  const [TodayLunchCheck, setTodayLunchCheck] = useState();

  useEffect(() => {
    let mounted = true;
    if (mounted && userInfo) {
      //식단체크
      let lunchCheck = {};
      firebase
      .database()
      .ref("lunch")
      .child(`user/${userInfo.uid}/checkList/${curDate.full}`)
      .once("value")
      .then((snapshot) => {
          if(snapshot.val()){
            lunchCheck.date = snapshot.val().date;
            lunchCheck.confirm = snapshot.val().confirm;
            lunchCheck.item = snapshot.val().item;
            setTodayLunchCheck(lunchCheck)
          }
      });
        

      //즐찾
      async function getProdItem() {
        let favorItem = [];
        await firebase
          .database()
          .ref("soldout")
          .once("value")
          .then((snapshot) => {            
            b_soldout = snapshot.val().b_soldout;
            m_soldout = snapshot.val().MilkSoldout;
            m_soldout2 = snapshot.val().MilkSoldout2;
          });
          
        await firebase
          .database()
          .ref("users")
          .child(`${userInfo.uid}/favorite`)
          .once("value")
          .then((snapshot) => {
            snapshot.forEach(function (item) {
              favorItem.push({
                name: item.key,
                add_favor: item.val().add_favor,
              });
            });
          });

        await firebase
          .database()
          .ref("products")
          .orderByChild("sort_num")
          .once("value")
          .then((snapshot) => {
            let array = [];
            snapshot.forEach(function (item) {
              array.push({
                uid: item.key,
                name: item.val().name,
                kal: item.val().kal,
                hot: item.val().hot,
                milk: item.val().milk,                
                category: item.val().category,
                image: item.val().image,
                price: parseInt(item.val().price),
                add: item.val().add,
                b_soldout: b_soldout,
                m_soldout: m_soldout,
                m_soldout2: m_soldout2,
                soldout: item.val().soldout,
                sort_num: item.val().sort_num ? item.val().sort_num : 9999,
              });
            });
            let newFavorItem = [];
            array.map((el) => {
              let name = el.name;
              favorItem.forEach((favor) => {
                if (favor.name === name) {
                  newFavorItem.push({
                    ...favor,
                    ...el,
                  });
                }
              });
              return el;
            });
            //array = { ...array, ...newFavorItem };
            newFavorItem.map((el) => {
              let uid = el.uid;
              let favor = el.add_favor;
              array.forEach((el) => {
                if (el.uid === uid) {
                  el.add_favor = favor;
                }
                return el;
              });
            });

            array.sort((a, b) => {
              return a.sort_num - b.sort_num;
            });

            array = array.filter((el) => {
              if (CateRadio === "all") {
                return el;
              }
              return el.category === CateRadio;
            });
            setProdItem(array);
            setProdItemCopy(array);
          });          
        }
        getProdItem();
      }else{
        setSearchAgain(!SearchAgain);
      }
      return function cleanup() {
        mounted = false;
      };
    }, [CateRadio, SearchAgain]);
    
    
    useEffect(() => {
      if (ProdItemCopy && searchInput !== "") {
      let array = _.cloneDeep(ProdItemCopy);
      array.forEach(function (item) {
        var dis = Hangul.disassemble(item.name, true);
        var cho = dis.reduce(function (prev, elem) {
          elem = elem[0] ? elem[0] : elem;
          return prev + elem;
        }, "");
        item.diassembled = cho;
      });
      let arr = searchInput.concat();
      let search = Hangul.disassemble(arr).join("");
      array = array.filter(function (item) {
        return (
          item.diassembled.includes(searchInput) ||
          item.diassembled.includes(search) ||
          item.name.includes(searchInput)
          );
        });
        setProdItem(array);
    }    
  }, [searchInput])

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const [OnModal, setOnModal] = useState(false);
  const [OrderItem, setOrderItem] = useState();
  const orderHandler = (e, item) => {
    if (e.target.tagName !== "svg" && e.target.tagName !== "path") {
      /*
      if(!TodayLunchCheck){
        alert('식단체크를 먼저 해야 주문이 가능합니다.');
        return;
      }
      if(TodayLunchCheck && !TodayLunchCheck.confirm){
        alert('오늘의 식단을 확인 해야 주문이 가능합니다.');
        return;
      }
      */
      
      if (b_soldout === false) {
        item.add = "";
      }
      setOrderItem(item);
      setPosX(e.clientX);
      setPosY(e.clientY);
      setOnModal(true);
    }
  };
  const onFinished = () => {
    setOnModal(false);
  };

  const TopBox = (
    <>
      <Search
        style={{ marginBottom: "10px" }}
        allowClear
        enterButton="검색"
        size="large"
        placeholder="실시간 검색(초성가능)"
        value={searchInput}
        onSearch={onSearch}
        onChange={onSearchChange}
        type="text"
      />
      <div className="menuCategory">
        <Radio.Group
          className="menuCategory"
          onChange={itemSort}
          defaultValue="all"
          buttonStyle="solid"
        >
          <Radio.Button value="all">전체</Radio.Button>
          <Radio.Button value="커피">커피</Radio.Button>
          <Radio.Button value="라떼">라떼</Radio.Button>
          <Radio.Button value="에이드">에이드</Radio.Button>
          <Radio.Button value="차">차</Radio.Button>
          <Radio.Button value="프로틴">프로틴</Radio.Button>
          <Radio.Button value="스낵">스낵</Radio.Button>
          <Radio.Button value="주스">주스</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  if (ProdItem.length) {
    return (
      <>
        {TopBox}
        <ProdList>
          {ProdItem.map((item, index) => (
            <div
              style={{ cursor: "pointer", position: "relative" }}
              className={`ani-fadein list delay-${index}`}
              key={index}
            >
              {item.soldout === false && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    left: "0",
                    top: "0",
                    display: "flex",
                    fontSize: "14px",
                    color: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "rgba(0,0,0,0.5)",
                    zIndex: "10",
                  }}
                >
                  sold out
                </div>
              )}
              <div className="img" onClick={(e) => orderHandler(e, item)}>
                <span style={{ opacity: "0.85" }} className="kal">
                  {item.kal}kal
                </span>
                <img src={item.image} alt="" />
              </div>
              <div className="user-box" onClick={(e) => orderHandler(e, item)}>
                <div className="txt" style={{ padding: "0 5px" }}>
                  <div className="flex-box between">
                    <span className="name">{item.name}</span>
                    <span
                      className={"ic-favor " + item.add_favor}
                      onClick={(e) => {
                        onToggleFavor(e, item.name);
                      }}
                    >
                      <antIcon.AiFillStar className="favor" />
                      <antIcon.AiOutlineStar className="no-favor" />
                    </span>
                  </div>
                  <div className="flex-box between a-center">
                    <span className="hot">
                      {item.hot === "etc" ? "" : item.hot}
                    </span>
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#888",
                      }}
                      className="price"
                    >
                      {commaNumber(item.price)}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ProdList>
        {OnModal && (
          <OderModalPopup
            onFinished={onFinished}
            posx={PosX}
            posy={PosY}
            OrderItem={OrderItem}
          />
        )}
      </>
    );
  } else if (searchInput) {
    return (
      <>
        {TopBox}
        <div style={{ paddingTop: "15px" }}>
          <Empty
            description={
              <span>
                검색결과가 없습니다.
                <br />
                ※검색어가 제대로 입력된 경우엔 검색버튼을 다시 눌러보세요.
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </>
    );
  } else {
    return (
      <>
        {TopBox}
        <Loading />
      </>
    );
  }
}

export default Menu;
