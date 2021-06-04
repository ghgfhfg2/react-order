import React, { useState, useEffect } from 'react';
import { Input,Button,DatePicker } from 'antd';
import firebase from "../../firebase";
import { getFormatDate } from '../CommonFunc';
import moment from 'moment';

const curDate = getFormatDate(new Date());

function LunchAdmin() {

  const [ItemList, setItemList] = useState();
  const [CheckInfoTxt, setCheckInfoTxt] = useState();
  const [TblItem, setTblItem] = useState();
  const [CheckList, setCheckList] = useState();
  const [ItemSum, setItemSum] = useState();

  const [SearchDate, setSearchDate] = useState(curDate);

  useEffect(() => {
    let itemArr = [];
    let itemObj = {};
    firebase.database().ref('lunch/item')
    .once('value', (snapshot) => {
      snapshot.forEach(el => {
        itemArr.push(el.val())
      });
      itemArr.map(el=>{
        itemObj[el] = 0;
      })
      setTblItem(itemArr);
      itemArr = itemArr.join(',');      
      setItemList(itemArr)
    })
    firebase.database().ref('lunch/info')
      .on('value', (snapshot) => {
        setCheckInfoTxt(snapshot.val())        
    });
    firebase.database().ref('lunch/user')
    .once('value', (snapshot) => {
      let arr = [];
      snapshot.forEach(el => {
        let elItemArr;
        if(el.val().checkList[SearchDate.full]){
          elItemArr = el.val().checkList[SearchDate.full].item;
        }
        if(elItemArr){
          elItemArr.map(el=>{
          itemObj[el] += 1;
          })       
          arr.push({
            name: el.val().name,
            part: el.val().part,
            item: elItemArr,
            confirm: el.val().checkList[SearchDate.full].confirm,
          })
        }
      })
      setCheckList(arr);
      setItemSum(itemObj);
    })


    return () => {
    }
  }, [SearchDate])

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      let arr;
      arr = e.target.item.value.split(',');      
      firebase.database().ref('lunch')
      .update({
        item:arr,
        info:e.target.check_info_txt.value
      })

    }catch (error) {
      console.error(error);
    }
  }

  const onSelectDate = (date, dateString) => {
    setSearchDate(getFormatDate(date._d))
  }
  function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }
  const disabledDate = (current) => {
    return current && current > moment().add(14, 'days');
  }

  return (
    <>
      {ItemList && 
        <>
          <form onSubmit={onSubmit}>
            <h3 className="title" style={{ margin: "0 0 5px 0" }}>
              식단 항목
            </h3>
            <div className="flex-box">
              <Input name="item" defaultValue={ItemList} />
            </div>
            <h3 className="title" style={{ margin: "15px 0 5px 0" }}>
              항목 설명글
            </h3>
            <div className="flex-box">
              <Input name="check_info_txt" defaultValue={CheckInfoTxt} />              
            </div>
            <div style={{textAlign:"center"}}>
              <Button
                      htmlType="submit"
                      type="primary"
                      size="large" 
                      style={{marginTop:"10px"}}               
                    >
                      설정저장
              </Button>
            </div>
          </form>
        </>
      }
      <h3 className="title" style={{ margin: "20px 0 5px 0" }}>
        식단체크
      </h3>
      <div className="flex-box">
        <DatePicker 
          format="YYYY-MM-DD"
          defaultValue={moment()}
          disabledDate={disabledDate} onChange={onSelectDate} 
        />
      </div>
      <table className="fl-table tbl-lunch-check" style={{marginTop:"12px"}}>
        <thead>
          <tr>
            <th scope="col">날짜</th>
            <th scope="col">이름</th>
            <th scope="col">부서</th>
            {TblItem && TblItem.map(el => (
              <th scope="col">{el}</th>
            ))}
            <th scope="col">체크여부</th>
          </tr>          
        </thead>
        <tbody>
          {CheckList && CheckList.map(el => (
            <tr>
              <td>{SearchDate.full_}</td>
              <td>{el.name}</td>
              <td>{el.part}</td>
              {TblItem && TblItem.map((list,l_idx) => (
                  <td>
                    {el.item.includes(list) && 1}
                  </td>
              ))}
              <td>
              {el.confirm && 'O'}
              </td>
            </tr>
          ))}
          <tr>
            <td>{SearchDate.full_}</td>
            <td>합계</td>
            <td></td>
            {TblItem && TblItem.map((el,idx) => (
              <td>
                {ItemSum && ItemSum[el]}
              </td>
            ))}
            <td></td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default LunchAdmin
