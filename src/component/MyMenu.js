import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber } from "./CommonFunc";
import { useSelector } from "react-redux";
import Loading from "./Loading";

function MyMenu() {
  const userInfo = useSelector((state) => state.user.currentUser);

  const [FavorItem, setFavorItem] = useState([]);
  const [ProdItem, setProdItem] = useState([]);
  const [SortItem, setSortItem] = useState(false);

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
            setProdItem(array);
          });
        setSortItem(true);
        if (FavorItem && ProdItem) {
          let array = ProdItem.concat();
          array = array.filter((el) => {
            return favorName.includes(el.name);
          });
          array.map((el, idx) => {
            return Object.assign(el, FavorItem[idx]);
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
          array = array.slice(0, 10);
          setProdItem(array);
        }
      }
      getProdItem();
    }
    return function cleanup() {
      mounted = false;
    };
  }, [SortItem]);

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
      {SortItem ? (
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
                <div className="txt" style={{ padding: "0 10px" }}>
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
      ) : (
        <>
          <Loading />
        </>
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
