import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber } from "./CommonFunc";
import { useSelector } from "react-redux";
import Loading from "./Loading";
import { Radio, Input, Empty } from "antd";

function MyMenu() {
  const userInfo = useSelector((state) => state.user.currentUser);

  const [FavorItem, setFavorItem] = useState([]);
  const [ProdItem, setProdItem] = useState([]);
  const [SortItem, setSortItem] = useState(0);

  let favor = [];
  let favorName = [];
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      async function getProdItem() {
        await firebase
          .database()
          .ref(`users/${userInfo.uid}/favorite`)
          .once("value")
          .then((snapshot) => {
            snapshot.forEach(function (item) {
              favorName.push(item.key);
              favor.push({
                name: item.key,
                count: item.val().count,
              });
            });
          });
        setFavorItem(favor);
        setSortItem(1);
        await firebase
          .database()
          .ref("products")
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
              return favorName.includes(el.name);
            });
            console.log(array);
            console.log(FavorItem);
            array.map((el, idx) => {
              console.log(1);
              return { ...FavorItem[idx], ...el };
            });
            array.sort((a, b) => {
              if (a.count > b.count) {
                return -1;
              }
              if (a.count < b.count) {
                return 1;
              }
              return 0;
            });
            console.log(array);
            setProdItem(array);
          });
      }
      getProdItem();
    }
    return function cleanup() {
      mounted = false;
    };
  }, []);

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

  return (
    <>
      <h3 className="title">내가 많이 주문한 메뉴</h3>
      {ProdItem && (
        <ProdList>
          {ProdItem.map((item, index) => (
            <div className={`ani-fadein list delay-${index}`} key={index}>
              <div className="img">
                <span className="kal">{item.kal}kal</span>
                <img src={item.image} alt="" />
              </div>
              <div
                className="admin-box"
                style={{ padding: "7px 0 41px 0", position: "relative" }}
              >
                <div className="txt" style={{ padding: "0 10px" }}>
                  <span className="name">{item.name}</span>
                  <div className="flex-box between a-center">
                    <span className="hot">{item.hot}</span>
                    <span className="price">{commaNumber(item.price)}원</span>
                  </div>
                </div>
                <button
                  className="order-btn"
                  onClick={(e) => orderHandler(e, item)}
                >
                  주문하기
                </button>
              </div>
            </div>
          ))}
        </ProdList>
      )}
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
}

export default MyMenu;
