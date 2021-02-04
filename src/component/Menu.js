import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber } from "./CommonFunc";
import Loading from "./Loading";
import { Radio, Input, Empty } from "antd";
import * as Hangul from "hangul-js";
const { Search } = Input;
const _ = require("lodash");

function Menu() {
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

  //즐찾
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      async function getProdItem() {
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
              });
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
          array = array.filter(function (item) {
            return (
              item.diassembled.includes(searchInput) ||
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
    setOrderItem(item);
    setPosX(e.clientX);
    setPosY(e.clientY);
    setOnModal(true);
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
              <div className="admin-box">
                <div className="txt" style={{ padding: "0 5px" }}>
                  <span className="name">{item.name}</span>
                  <div className="flex-box between a-center">
                    <span className="hot">{item.hot}</span>
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
