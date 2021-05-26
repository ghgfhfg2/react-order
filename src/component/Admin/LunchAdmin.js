import React, { useState, useEffect } from 'react';
import { Input,Button } from 'antd';
import firebase from "../../firebase";
import { getFormatDate } from '../CommonFunc';

const curDate = getFormatDate(new Date());

function LunchAdmin() {

  const [ItemList, setItemList] = useState();
  useEffect(() => {
    firebase.database().ref('lunch/item')
    .on('value', (snapshot) => {
      let arr = [];
      snapshot.forEach(el => {
        arr.push(el.val())
      })
      arr = arr.join(',')
      setItemList(arr)
    })

    firebase.database().ref('lunch/user')
    .on('value', (snapshot) => {
      let arr = [];
      snapshot.forEach(el => {
        arr.push({
          name: el.val().name,
          item: el.val().checkList[curDate.full].item,
          confirm: el.val().checkList[curDate.full].confirm,
        })
      })
      console.log(arr)
    })



    return () => {
      firebase.database().ref('lunch/item').off();
    }
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let arr;
      arr = e.target.item.value.split(',');      
      firebase.database().ref('lunch')
      .update({
        item:arr
      })

    }catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      {ItemList &&
        <>
          <form onSubmit={onSubmit}>
            <h3 className="title" style={{ margin: "0 0 5px 0" }}>
              식단항목
            </h3>
            <div className="flex-box">
              <Input name="item" defaultValue={ItemList} />
              <Button
                    htmlType="submit"
                    type="primary"
                    size="large"                
                  >
                    설정
              </Button>
            </div>
          </form>
        </>
      }
      <table className="fl-table" style={{marginTop:"12px"}}>
        <thead>
          <tr>
            <th scope="col" rowSpan="2">이름</th>
            <th scope="col">식단</th>
            <th scope="col">체크여부</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
    </>
  )
}

export default LunchAdmin
