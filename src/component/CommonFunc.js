export const commaNumber = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const getNotificationPermission = () => {
    // 브라우저 지원 여부 체크
    if (!("Notification" in window)) {
        alert("데스크톱 알림을 지원하지 않는 브라우저입니다.");
    }
    // 데스크탑 알림 권한 요청
    Notification.requestPermission(function (result) {
        // 권한 거절
        if(result == 'denied') {
            alert('알림을 차단하셨습니다.\n브라우저의 사이트 설정에서 변경하실 수 있습니다.');
            return false;
        }
    });
}

// 알림 띄우기
export function notify(msg) {
    var options = {
        body: msg
    }
    var notification = new Notification("주문알림", options);
    
    setTimeout(function(){
        notification.close();
    }, 3000);
  }