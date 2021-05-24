import React from 'react';
import { getFormatDate } from './CommonFunc';
import { Radio } from "antd";

const curDate = getFormatDate(new Date());
const weekNum = curDate.weekNum;
let date = new Date();
new Date(date.setDate(date.getDate() - weekNum + 7));
let curWeekArr = [];
let i = 0;
while(i < 7){
  curWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() - 1))));
  i++;
}
curWeekArr = curWeekArr.sort((a,b) => {
  if(a.full < b.full){
    return -1;
  }
});
curWeekArr.pop();
curWeekArr.shift();

date = new Date();
new Date(date.setDate(date.getDate() - weekNum));
let prevWeekArr = [];
let n = 0;
while(n < 7){
  prevWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() - 1))));
  n++;
}
prevWeekArr = prevWeekArr.sort((a,b) => {
  if(a.full < b.full){
    return -1;
  }
});
prevWeekArr.pop();
prevWeekArr.shift();

date = new Date();
new Date(date.setDate(date.getDate() + (6-weekNum)));
let nextWeekArr = [];
let j = 0;
while(j < 7){
  nextWeekArr.push(getFormatDate(new Date(date.setDate(date.getDate() + 1))));
  j++;
}
nextWeekArr.pop();
nextWeekArr.shift();


function Test() {
  return (
    <>
      <ul className="week_list">
        {prevWeekArr.map((el,idx) => (
          <li>
            {el.full}
            
          </li>
        ))}
      </ul>
      <ul className="week_list">
        {curWeekArr.map((el,idx) => (
          <li>
            {el.full}
            <div>
              {el.full == curDate.full &&
                <>
                </>
              }
            </div>
          </li>
        ))}
      </ul>  

      <ul className="week_list">
        {nextWeekArr.map((el,idx) => (
          <li>
            {el.full}
            <Radio.Group>
              <Radio.Button value="0">일반식</Radio.Button>
              <Radio.Button value="1">다식</Radio.Button>
            </Radio.Group>
          </li>
        ))}
      </ul>  

      
    </>
  )
}

export default Test
