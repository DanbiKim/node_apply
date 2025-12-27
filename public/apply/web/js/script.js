$(document).ready(function(){

    // 우선소개동의 남자 default 
    // 여자는 선택
    $('[name=profile_YN]').val('Y');

    $('.m_view_data').hide();
    $('.f_view_data').hide();

    $('#profilePage').hide();
    $('#photoPage').hide();
    $('#conditionPage').hide();

    $('#M_photoGuidePage').hide();
    $('#F_photoGuidePage').hide();
    $('#idGuidePage').hide();
    
    $(document).on("change", '[id^="img_"]', function() {
        readURL(this);
    });
    
    $(document).on("change", '[id$="_img"]', function() {

        $('#'+$(this).attr('id')+'_back').attr('background','');

        readURL(this);
    });

     // 이벤트 위임 사용 (동적으로 로드된 요소에도 작동)
    $(document).on("click", '.photo-list li', function() {
        var file_name = $(this).data('name');
        $("input[id='"+file_name+"']").click();
    });
    $(document).on("click", '.photo-certification', function() {
        var file_name = $(this).data('name');
        $("input[id='"+file_name+"']").click();
    });


     $(document).on("click", "#checkAll", function(){
        var isChecked = $(this).is(":checked");
        $("#check1, #check2, #check3").prop("checked", isChecked);

    });     

    $(document).on("click", ".checkRadio", function(){
        if(!this.checked) {
            $("#checkAll").prop("checked", false);
        }

        if($("#check1").is(":checked") && $("#check2").is(":checked") && $("#check3").is(":checked") ){
            $("#checkAll").prop("checked", true);
        }
    });  

    // 팝업 외부 클릭 시 닫기
    $(document).mouseup(function (e) {
        var popup = $('div[class="popup on"]');
        if (popup.length > 0 && !popup.is(e.target) && popup.has(e.target).length === 0){
            popClose(popup.attr('id'));
        }   
    });

    // 지도 
    // 내 지역 
    $(document).on("click", '[id^="area"] .map-wrap label', function(){
        $('[id^="area"] .map-wrap label').removeClass('on');

        var $this = $(this);
        var map_value = $this.attr('for');
        var map_name = $('#'+$this.attr('for')).val();

        $this.addClass('on');
        $('#map_my').val($('#'+map_value).val());
        $('#_area').val(map_name);

        $.ajax({
            url: '/api/kakao-address',  // 변경된 부분!
            type: 'GET',
            data: {
                query: map_name
            },
            success: function(res){
                if(res.documents && res.documents.length > 0) {
                    $('#address_x').val(res.documents[0].x);
                    $('#address_y').val(res.documents[0].y);
                } else {
                    console.warn('주소를 찾을 수 없습니다');
                }
            },
            error: function(err) {
                console.error('주소 검색 실패:', err);
                alert('주소 검색에 실패했습니다. 다시 시도해주세요.');
            }
        });
    });

    // 배열 리스트 선택 이벤트 (자신의 이미지/성격, 상대방 조건 등)
    $(document).on("click", '.arrayList li', function(){
        var $children = $(this).children();
        var $parent = $(this).parent();
        var maxCount = $parent.data('max')?$parent.data('max'):1;
        var nextPopup = $parent.data('next')?$parent.data('next'):'';

        if($children.is(":checked")){
            $children.prop("checked", false);
        }else{
            $children.prop("checked", true);
        }

        var sum = 0; 
        $("input[name='"+$children.attr('name')+"']").each(function(i){
            if($("input[name='"+$children.attr('name')+"']").eq(i).is(":checked")){
                sum++;
            }
        });

        if(sum > maxCount){
            $children.prop("checked", false);
        }

        if(sum == maxCount){
            popClose($parent.parent().attr("id"));
            if (nextPopup === 'idearAge' || nextPopup === 'coment') {
                popOpenPass(this, 30);
            } else {
                popOpenPass(this, 21);
            }
        }

        var view_value = '';
        $("input[name='"+$children.attr('name')+"']").each(function(i){
            if($("input[name='"+$children.attr('name')+"']").eq(i).is(":checked")){
                view_value = view_value + $("input[name='"+$children.attr('name')+"']").eq(i).parent().text().trim();
            }
        });

        view_value = (view_value.length > 5) ? view_value.substr(0,5)+'...' : view_value;
        
        // characterType 팝업의 경우 _characterType input 업데이트
        var popupId = $parent.parent().attr("id");
        if(popupId === 'characterType') {
            $('#_characterType').val(view_value);
        } else {
            $('#_'+popupId).val(view_value);
        }
    });

    $(document).on("click", ".arrayBtn", function () {
        var popupName = $(this).parent().attr("id");
        var nextPopup = $(this).prev(".arrayList").data("next");
        popClose(popupName);
        popOpenAndDim(nextPopup,true);   
    });

    // agree : 성별 
    // profile : 직업 키 체형 자차 흡연 음주 종교 군필 거주지역
    $(document).on("click", ".selectList li", function() {
        var $this = $(this);
        $this.siblings('li').removeClass("on");
        $this.addClass("on");

        var value = $this.data('value');
        var inputName = $this.data('nm');
        var label = ($this.text().length > 5) ? $this.text().substr(0,5)+'...' : $this.text();

        // #area 팝업의 경우 특별 처리 (data-nm이 없어도 처리)
        // 단, 다른 selectList에는 영향을 주지 않도록 조건 명확화
        var $popup = $this.closest('.popup');
        if($popup.length > 0 && $popup.attr('id') === 'area' && !inputName) {
            inputName = 'area';
            value = $this.text().trim();
            label = $this.text().trim();
        }

        if(inputName){      
            $('#'+inputName).val(value);
            $('#_'+inputName).val(label);
        }

        if(inputName == 'gender'){
            if(value == 'M'){
                $('.m_view_data').show();
                $('.f_view_data').hide();
                $('#profile_YN').val('Y');
            }else{
                $('.m_view_data').hide();
                $('.f_view_data').show();
            }
        }
    }); 

    // 달력 스크롤 위치 중앙정렬
    $.fn.scrollCenter = function(elem, speed) {
        var active = $(this).find(elem);
        var activeHeight = active.height() / 2;
        var pos = active.position().top + activeHeight;
        var elpos = $(this).scrollTop();
        var elH = $(this).height();
        pos = pos + elpos - elH;
        
        $(this).animate({
            scrollTop: pos
        }, speed == undefined ? 1000 : speed);
        return this;
    };

    $(document).on("click", ".birthday", function() {
        $(".datepicker .year ul").scrollCenter(".on", 300);
        $(".datepicker .month ul").scrollCenter(".on", 300);
        $(".datepicker .day ul").scrollCenter(".on", 300);
    });
    
    // 생년월일 선택 이벤트 (이벤트 위임 사용)
    // year, month, day의 li 요소 모두 선택
    $(document).on("click", "#birthday #year li, #birthday #month li, #birthday #day li", function(e) {
        e.stopPropagation(); // 이벤트 버블링 방지로 팝업 닫힘 방지
        e.preventDefault(); // 기본 동작 방지
        var $this = $(this);
        $this.siblings('li').removeClass("on");
        $this.addClass("on");
        $this.closest('ul').scrollCenter(".on", 300);
        console.log('Date selected:', $this.text(), $this.attr('value')); // 디버깅용
    });

    $(document).on("click", ".heightOpen", function() {  
        var $this = $('#userHeight ul li');
        $this.siblings('li').removeClass("on");

        if($('[name=gender]').val() == 'M'){
            $('#userHeight ul [data-value="175"]').addClass('on');
        }else{
            $('#userHeight ul [data-value="160"]').addClass('on');
        }

        $('#userHeight ul').scrollCenter(".on", 300);
    });

    //range slider
    var isHasSlider = $('#rangeSlider').length > 0; // 객체 체크

    if(isHasSlider){
        var slider = document.getElementById('rangeSlider'); 
        noUiSlider.create( slider, {
            start: [20, 40], 
            decimals: 0,
            step: 1,
            connect: true, 
            range: { 'min': 20, 'max': 45 },
        } );
        
        var sliderValue = [
            document.getElementById('ageLow'),
            document.getElementById('ageUpper')
        ];
        
        slider.noUiSlider.on('update', function (values, handle) {

            $('#ideal_age_1').val(parseInt(values[0]));
            $('#ideal_age_2').val(parseInt(values[1]));
            $('#_ideal_age').val(parseInt(values[0])+'세~'+parseInt(values[1])+'세');

            sliderValue[handle].innerHTML = Math.floor(values[handle]);
        });
    }

    //range slider
    var isHasHeightSlider = $('#heightSlider').length > 0; // 객체 체크

    if(isHasHeightSlider){
        var sliderHeight = document.getElementById('heightSlider'); 
        noUiSlider.create( sliderHeight, {
            start: [110, 200], 
            decimals: 0,
            step: 1,
            connect: true, 
            range: { 'min': 110, 'max': 250 },
        } );
        
        var sliderHeightValue = [
            document.getElementById('heightLow'),
            document.getElementById('heightUpper')
        ];
        
        sliderHeight.noUiSlider.on('update', function (values, handle) {
            
            $('#ideal_height_1').val(parseInt(values[0]));
            $('#ideal_height_2').val(parseInt(values[1]));
            $('#_ideal_height').val(parseInt(values[0])+'cm~'+parseInt(values[1])+'cm');

            sliderHeightValue[handle].innerHTML = Math.floor(values[handle]);
        });
    }


});

var _APPLY = {
    init: function () {

    },
    eventListener: function () {
   
    },
}

// 페이지 변경
function changePage(targetPage) {
    location.hash = targetPage;
    $('.sub.join').hide();
    $('.popup').removeClass('on');
    $('#'+targetPage).show();
    dimRemove();
}

// dim 생성
function dimMaker() {
    $('body').append('<div class="dim"></div>');
    bodyHidden();
}

// dim 제거
function dimRemove() {
    $('.dim').remove();
    bodyAuto();
}

// body scroll hidden
function bodyHidden() {
    $('body').css('overflow', 'hidden');
}

// body scroll auto
function bodyAuto() {
    $('body').css('overflow', 'auto')
}

const arrPop = {
    name: '_user_name', 
    birthday: '_birthday', 
    pop_gender: '_gender',
    tel: '_tel',
    area: '_area',
    pop_job: '_job_detail',
    jobDetail: '_job',
    education: '_major',
    pop_hobby: '_hobby',
    characterType: '_characterType',
    personality: '_personality',
    userHeight: 'user_height',
    bodyWoman: '_user_form',
    smoking: '_smoke',
    drinking: '_drink',
    pop_religion: '_religion',
    militaryWriting: '_army_yn',
    checkCar: 'car_yn',
    checkDolsing: 'dolsing_yn',
    checkChildren: 'children_yn',
    aboutMe: 'mind',
    look: '_look',
    idearAge: '_ideal_age',
    idearHeight: '_ideal_height',
    opponentSmoking: '_ideal_smoke',
    opponentDrinking: '_ideal_drink',
    meetType: '_call_type',
    profileAlarm: '_profile_YN',
    reasonCondition: '_reasonCondition',
    coment: 'ideal_first_add'
};

function popUsed(id) {
    let dataInput = $('input[name=' + id + ']').val();
    if (!dataInput && id === 'mind') dataInput = $('textarea[name=' + id + ']').val();
    if (!dataInput && id === 'ideal_first_add') dataInput = $('textarea[name=' + id + ']').val();
    return !dataInput;
}

// 팝업닫을때 다음 팝업 감지 후 오픈
function popOpenPass(e, limit) {
    const id = $(e).parents('div').data('id') || $(e).parents('div').attr('id');
    // 다음 팝업 여부 확인 (마지막 팝업까지)
    let idx = Object.keys(arrPop).indexOf(id);

    while (idx + 1 < limit) {
        idx++;
        const next = Object.keys(arrPop)[idx];

        let use = true;
        if (next === 'militaryWriting' && $('input[name=gender]').val() != 'M') use = false;
        if (next === 'checkCar' && $('input[name=gender]').val() != 'M') use = false;
        if (next === 'profileAlarm' && $('input[name=gender]').val() == 'M') use = false;

        const isEmpty = use && popUsed(arrPop[next]);
        if (isEmpty) {
            console.log(next);
            if (next === 'userHeight') {
                heightOpen();
            } else {
                popOpenAndDim(next, true);
            }
            idx = arrPop.length;
        }
    }
}

// 팝업열기
function popOpen(id){
    var $popup = $("#" + id);
    if ($popup.length === 0) {
        console.error('popOpen: Element not found:', id);
        return;
    }
    $popup.addClass('on');
    console.log('popOpen: Added class "on" to', id);
}

// 팝업닫기
function popClose(id) {
    console.log('popOpen: Remove class "on" to', id);
    var $popup = $("#" + id);
    $popup.removeClass('on');
    dimRemove();
}

function popCloseAll() {
    $(".popup").removeClass('on');
    dimRemove();
}

// dim 옵션 팝업 열기
function popOpenAndDim(id, isDim){
    console.log('popOpenAndDim called with id:', id, 'isDim:', isDim);
    var $popup = $("#" + id);
    if ($popup.length === 0) {
        console.error('Popup element not found:', id);
        return;
    }
    popOpen(id);
    
    // birthday 팝업이 열릴 때 스크롤 중앙 정렬
    if(id === 'birthday') {
        setTimeout(function() {
            $(".datepicker .year ul").scrollCenter(".on", 300);
            $(".datepicker .month ul").scrollCenter(".on", 300);
            $(".datepicker .day ul").scrollCenter(".on", 300);
        }, 100);
    }
    
    // characterType, bodyWoman, look 팝업이 열릴 때 성별에 따라 리스트 표시
    if(id === 'characterType' || id === 'bodyWoman' || id === 'look') {
        var gender = $('[name=gender]').val();
        
        // 성별이 선택되지 않은 경우 첫 페이지로 이동
        if(!gender || (gender !== 'M' && gender !== 'F')) {
            alert('성별을 먼저 선택해주세요.');
            changePage('agreePage');
            return;
        }
        
        var $mView = $popup.find('.m_view_data');
        var $fView = $popup.find('.f_view_data');

        
        if(gender === 'M') {
            $fView.hide();
            $mView.removeAttr('style').css('display', 'block');
        } else if(gender === 'F') {
            $mView.hide();
            $fView.removeAttr('style').css('display', 'block');
        }
    }
    
    if(isDim == true){
        dimMaker();
    }
}

function heightOpen() {
    popCloseAll();
    popOpenAndDim('userHeight', true);
    
    var $this = $('#userHeight ul li');
    $this.siblings('li').removeClass("on");

    if($('[name=gender]').val() == 'M') {
        $('#userHeight ul [data-value="175"]').addClass('on');
    } else {
        $('#userHeight ul [data-value="160"]').addClass('on');
    }

    $('#userHeight ul').scrollCenter(".on", 300);
} 

function textValidation( popupName, key ){

    var value = $("#"+key).val();

    $("#_"+key).val(value);

    if(key == 'mind'){
        $('#mind_text').text(value);
    }

    if(key == 'ideal_first_add'){
        $('#ideal_first_add_text').text(value);
    }

    popClose(popupName);
}

function birthValidation(e, limit) {
    var year = $('#year li[class="on"]').val();
    var month = $('#month li[class="on"]').val();
    var day = $('#day li[class="on"]').val();

    var currentTime = new Date();
    var currentYear = currentTime.getFullYear();

    //
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    //

    popClose('birthday');

    if(age < 19 || currentYear-year > 52) {
        popOpenAndDim('alertAge', true);
    } else {
        $("#birth_y").val(year);
        $("#birth_m").val(month);
        $("#birth_d").val(day);
        $("#_birthday").val(year+"/"+month+"/"+day);
        popOpenPass(e, limit);
    }
}

function phoneValidation(){
    textValidation('tel', 'tel');
    $.ajax({
        async: false,
        url: '/api/apply/check-phone',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ user_tel : $('[name=user_tel]').val().replace(/[^0-9]/g, '') }),
        error : function(){
            $('[name=user_tel]').val('');
            $('#_tel').val('');
            popOpenAndDim('errorCertification', true);
        },
        success : function(res){
            console.log(res);
            if (res.success) {
                $('[name=tel_check]').attr('value','Y');
                $('#_tel').val($('[name=user_tel]').val());
                popOpenAndDim('checkCertification', true);
            }else{
                $('[name=tel_check]').attr('value','N');
                $('[name=user_tel]').val('');
                $('#_tel').val('');
                popOpenAndDim('acountDuplication', true);
            }
        }
    });
}

function religionValidation(e){
    popClose('pop_religion');
    if($('[name=gender]').val() == 'M'){
        $(e).parents('div').data('id', 'pop_religion');
    } else {
        $(e).parents('div').data('id', 'militaryWriting');
    }
    popOpenPass(e, 21);
}

function callTypeValidation(e){
    popClose('meetType');
    popOpenPass(e, 30);
}

function idearAgeValidation(e){

    var min = $('[name=ideal_age_1]').val();
    var max = $('[name=ideal_age_2]').val();

    // 경고문구 제거요청(21.04)
    // if(min>=max){
    //     popOpenAndDim('checkValue', true);
    //     popClose('idearAge');
    // }else{
        $('[name=_ideal_age]').val(min+'세 ~'+max+'세');

        popClose('idearAge');
        // popOpenAndDim('idearHeight', true);
        popOpenPass(e, 30);
    // }
}

function idearHeightValidation(e){
    var min = $('[name=ideal_height_1]').val();
    var max = $('[name=ideal_height_2]').val();

    // 경고문구 제거요청(21.04)
    // if(min>=max){
    //     popOpenAndDim('checkValue', true);
    //     popClose('idearHeight');
    // }else{
        $('[name=_ideal_height]').val(min+'cm ~'+max+'cm');

        popClose('idearHeight');
        // popOpenAndDim('opponentSmoking', true);
        popOpenPass(e, 30);
    // }
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $("#_"+input.id).attr('src', e.target.result);
            $("#_"+input.id).css('display','');
            // $("#"+input.id+"_img").css('background', 'url(' + e.target.result + ')');
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function agreeValidation(){

    if (!$('[name=check1]').is(":checked") || !$('[name=check2]').is(":checked") ) {
        alert('약관에 동의해 주세요.');
        return false;
    }

    if (!$.trim($('[name=user_name]').val())) {
        alert('이름을 입력해 주세요');
        return false;
    }

    if (!$('[name=birth_y]').val() ) {
        alert('생년월일을 입력해 주세요.');
        return false;
    }

    if (!($('[name=gender]').val())) {
         alert('성별을 체크해 주세요');
         return false;
    }

    if ($('[name=tel_check]').val()=='N') {
         alert('핸드폰 번호를 확인해주세요');
         return false;
    }

    location.hash = 'profilePage';
}

function profileValidation(){
    if (!($('[name=map_my]').val())) {
         alert('거주지역을 체크해 주세요.');
         return false;
    }
    if (!($('[name=job_detail]').val())) {
         alert('직업을 선택해 주세요.');
         return false;
    }
    if (!($('[name=job]').val())) {
         alert('직업 추가 설명을 입력해 주세요.');
         return false;
    }
    if (!($('[name=major]').val())) {
         alert('학력을 입력해 주세요.');
         return false;
    }
    if (!($('[name=hobby]').val())) {
         alert('취미을 입력해 주세요.');
         return false;
    }
    if (!($('[name="feel_user[]"]').is(":checked"))) {
         alert('이미지을 선택해 주세요.');
         return false;
    }
    if (!($('[name="charm[]"]').is(":checked"))) {
         alert('성격을 선택해 주세요.');
         return false;
    }
    if (!($('[name=user_height]').val())) {
         alert('키를 선택해 주세요.');
         return false;
    }
    if (!($('[name=user_form]').val())) {
         alert('체형을 선택해 주세요.');
         return false;
    }
    if (!($('[name=smoke]').val())) {
         alert('흡연을 선택해 주세요.');
         return false;
    }
    if (!($('[name=drink]').val())) {
         alert('음주을 선택해 주세요.');
         return false;
    }
    if (!($('[name=religion]').val())) {
         alert('종교을 선택해 주세요.');
         return false;
    }

    if($('[name=gender]').val() == 'M'){
        if (!($('[name=army_yn]').val())) {
             alert('군필 여부을 선택해 주세요.');
             return false;
        }
        if (!($('[name=car_yn]').val())) {
             alert('자차 유무를 선택해 주세요.');
             return false;
        }
    }

    if (!($('[name=mind]').val())) {
         alert('자기소개를 입력해 주세요.');
         return false;
    }

    location.hash = 'photoPage';
}

function photoValidation(){
    if ($('[name=img_1]').val() == "") {
         alert('메인사진을 선택해 주세요.');
         return false;
    }
    if ($('[name=img_2]').val() == "") {
         alert('필수사진을 선택해 주세요.');
         return false;
    }

    location.hash = 'conditionPage';
}

let isSave = false;

function conditionValidation(){
    if (!($('[name="feel_ideal[]"]').is(":checked"))) {
         alert('상대방 외모를 선택해 주세요.');
         return false;
    }
    // if (!($('[name="charm[]"]').is(":checked"))) {
    //      alert('성격을 선택해 주세요.');
    //      return false;
    // }

    if (!($('[name=ideal_age_1]').val()) || !($('[name=ideal_age_2]').val())) {
        alert('상대방 나이를 선택해 주세요.');
        return false;
    }

    if (!($('[name=ideal_height_1]').val()) || !($('[name=ideal_height_2]').val())) {
         alert('상대방 키를 선택해 주세요.');
         return false;
    }

    if (!($('[name=ideal_smoke]').val())) {
         alert('상대방 흡연여부를 선택해 주세요.');
         return false;
    }
    if (!($('[name=ideal_drink]').val())) {
         alert('상대방 음주여부를 선택해 주세요.');
         return false;
    }
    if (!($('[name=call_type]').val())) {
         alert('소개팅 이후 만남일정을 선택해 주세요.');
         return false;
    }
    if ($('[name=gender]').val() == 'F' && !($('[name=profile_YN]').val())) {
         alert('프로필 활용 동의을 선택해 주세요.');
         return false;
    }
    if (!($('[name="ideal_first[]"]').is(":checked"))) {
         alert('소개팅 조건 우선순위를 선택해 주세요.');
         return false;
    }

    $(window).unbind('beforeunload');
    isSave = true;
    
    // 폼 데이터 수집
    const formData = new FormData($('#reg_form')[0]);
    
    // AJAX로 Node.js API에 제출
    $.ajax({
        url: '/api/apply/register',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(res) {
            if (res.success) {
                // 성공 시 완료 페이지로 이동
                window.location.href = '/apply/complete.html';
            } else {
                alert(res.message || '등록에 실패하였습니다.');
                isSave = false;
                $(window).bind('beforeunload', function(e) {
                    if (!isSave) {
                        e.preventDefault();
                        return '작성중인 내용을 취소하고 나가시겠습니까?';
                    }
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Registration error:', error);
            alert('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
            isSave = false;
            $(window).bind('beforeunload', function(e) {
                if (!isSave) {
                    e.preventDefault();
                    return '작성중인 내용을 취소하고 나가시겠습니까?';
                }
            });
        }
    });
}

function checkNumber(ele) {
    ele.target.value = ele.target.value.replace(/[^0-9]/g, '')
    .replace(/^(\d{3})(\d{3})(\d{4})$/, `$1-$2-$3`)
    .replace(/^(\d{3})(\d{4})(\d{1,4})$/, `$1-$2-$3`)
    .replace(/^(\d{3})(\d{4})$/, `$1-$2-`)
    .replace(/^(\d{3})(\d{1,3})$/, `$1-$2`)
    .replace(/^(\d{3})$/, `$1-`);
}