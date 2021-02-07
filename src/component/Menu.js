import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber } from "./CommonFunc";
import Loading from "./Loading";
import { Radio, Input, Empty } from "antd";
import * as antIcon from "react-icons/ai";
import * as Hangul from "hangul-js";
import { useSelector } from "react-redux";
const { Search } = Input;
const _ = require("lodash");

function Menu() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const [ProdItem, setProdItem] = useState([]);

  //정렬 라디오버튼
  const [CateRadio, setCateRadio] = useState("all");
  const itemSort = (e) => {
    setCateRadio(e.target.value);
  };

  //검색
  const [searchInput, setSearchInput] = useState("");
  const onSearchChange = (e) => {
    setSearchInput(e.target.value);
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

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      //즐찾
      async function getProdItem() {
        let favorItem = [];
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
                category: item.val().category,
                image: item.val().image,
                price: item.val().price,
                add: item.val().add,
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
          });

        if (searchInput !== "") {
          let array = _.cloneDeep(ProdItem);
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
      }
      getProdItem();
    }
    return function cleanup() {
      mounted = false;
    };
  }, [CateRadio, searchInput, SearchAgain]);

  const [PosX, setPosX] = useState(0);
  const [PosY, setPosY] = useState(0);
  const [OnModal, setOnModal] = useState(false);
  const [OrderItem, setOrderItem] = useState();
  const orderHandler = (e, item) => {
    if (e.target.tagName !== "svg" && e.target.tagName !== "path") {
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
              style={{ cursor: "pointer" }}
              className={`ani-fadein list delay-${index}`}
              key={index}
              onClick={(e) => orderHandler(e, item)}
            >
              <div className="img">
                <span style={{ opacity: "0.85" }} className="kal">
                  {item.kal}kal
                </span>
                <img src={item.image} alt="" />
              </div>
              <div className="user-box">
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
