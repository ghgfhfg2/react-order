import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { ProdList } from "./Admin/AdminProd";
import OderModalPopup from "./OrderModal";
import { commaNumber } from "./CommonFunc";
import Loading from "./Loading";
import { Radio } from 'antd';

function Menu() {
  const [ProdItem, setProdItem] = useState([]);


  //정렬 라디오버튼
  const [CateRadio, setCateRadio] = useState("all")
  const itemSort = (e) => {
    setCateRadio(e.target.value);    
  }  
  useEffect(() => {
    let mounted = true;
    if(mounted){
    firebase
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
          });
        });        
        array = array.filter(el => {
          if(CateRadio === 'all'){
            return el
          }
          return el.category === CateRadio
        })
        setProdItem(array);
      });
    }
    return function cleanup() {
      mounted = false
    }
  }, [CateRadio]);

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
 

  if(ProdItem.length){
  return (
    <>
      <h3 className="title">메뉴판</h3>

      <Radio.Group onChange={itemSort} defaultValue="all" buttonStyle="solid">
        <Radio.Button value="all">전체</Radio.Button>
        <Radio.Button value="커피">커피</Radio.Button>
        <Radio.Button value="c">cate3</Radio.Button>
        <Radio.Button value="d">cate4</Radio.Button>
      </Radio.Group>      
      <ProdList>
        {ProdItem.map((item, index) => (
          <div className="list" key={index}>
            <div className="img">
              <span className="kal">{item.kal}kal</span>
              <img src={item.image} alt="" />
            </div>
            <div className="admin-box" style={{padding:"7px 0 41px 0",position:"relative"}}>
              <div className="txt" style={{padding:'0 10px'}}>
                <span className="name">{item.name}</span>
                <div className="flex-box between a-center">
                  <span className="hot">{item.hot}</span>
                  <span className="price">{commaNumber(item.price)}원</span>
                </div>
              </div>              
              <button className="order-btn" onClick={(e) => orderHandler(e, item)}>주문하기</button>            
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
  )
}else{
  return (
    <>
     <Loading />
    </>
  )
}
}

export default Menu;
