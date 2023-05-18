var QUEUE_COMMENTABLE_STATE = false;
window.QUEUE_COMMENTABLE_STATE = QUEUE_COMMENTABLE_STATE;

function toggleQueueCommentable(boolean){
  QUEUE_COMMENTABLE_STATE = boolean;
} 
window.toggleQueueCommentable = toggleQueueCommentable;

// api to talk to parent 
window.addEventListener('message', function(event) {
  // console.log("message received", event); 
  if(event.data.execute == "delete_circle"){
    queueRemoveAllCircles();
  }

  if(event.data.execute == "toggleQueueCommentable"){
    toggleQueueCommentable(event.data.boolean);
    queueRemoveAllCircles();
  }
  
  if(event.data.execute == "queueRemoveAllVideoMarkerCircles"){
     console.log("Execute:queueRemoveAllVideoMarkerCircles")
     queueRemoveAllVideoMarkerCircles();
  }

  if(event.data.execute == "addVideoMarkerCircle"){
//     console.log("addVideoMarkerCircle", event);
    let video_marker = event.data.video_marker;

    var element = document.querySelectorAll(`${video_marker.dom_tag}${video_marker.class_list.length > 0 ? `.${video_marker.class_list}` : ``}`)[video_marker.dom_index]
    if((element != undefined) && document.getElementById(`video-marker-circle-${video_marker.id}`) == null){
      addVideoMarkerCircle(element, video_marker)
    }
  }

  if(event.data.execute == "highlightMarker"){
    if(event.data.boolean){
      document.querySelectorAll(".outline-yellow").forEach(e => e.classList.remove("outline-yellow"))
      document.querySelectorAll("body").forEach(e => e.classList.remove("default-cursor"))
      document.querySelectorAll(".q-circle-video-marker").forEach(e => e.classList.remove("q-display-none"))
    } else {
      document.querySelectorAll(".outline-yellow").forEach(e => e.classList.add("outline-none"))
      document.querySelectorAll(".outline-blue-dashed").forEach(e => e.classList.remove("outline-blue-dashed"))
      document.querySelectorAll("body").forEach(e => e.classList.add("default-cursor"))
      document.querySelectorAll(".q-circle-video-marker").forEach(e => e.classList.add("q-display-none"))
    }
  }

  // Find the marker on the page and go to it. 
  if(event.data.execute == "goToElement"){
    var element = document.getElementById(`video-marker-circle-${event.data.video_marker_id}`)
    // !important: update wrongUrl detection and redirect user appropriately. 
    if(element == undefined /*&& !wrongUrl*/){
      notice("This element may be hidden behind another element or has been removed.")
    } else {
      setTimeout(function(){ 
        if(!isInViewport(element)){
          element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
        }
      }, 100);
      document.querySelectorAll(".q-background-blue").forEach(e => e.classList.remove("q-background-blue"))
      document.querySelectorAll(`[data-videomarkerid="${event.data.video_marker_id}"]`)[0].classList.add("q-background-blue")
    }
  }
}, false);

document.addEventListener('keydown', function(e) {
  if (e.keyCode == 27) {
//     console.log("27 pressed")
    queueRemoveAllCircles();
    window.parent.postMessage({execute: "hideCommentForm"})
  }
});

// const queueRemoveAllCircles = () => {
function queueRemoveAllCircles () {
  document.querySelectorAll('.outline-blue-dashed').forEach(e => e.classList.remove("outline-blue-dashed"));
  document.querySelectorAll('.outline-blue').forEach(e => e.classList.remove("outline-blue"));
  document.querySelectorAll("[data-queuevideomarker]").forEach(e => e.removeAttribute("data-queuevideomarker"));
  document.querySelectorAll('.q-circle').forEach(e => e.remove());
}

// Remove all video marker circles
function queueRemoveAllVideoMarkerCircles () {
  document.querySelectorAll('.q-circle-video-marker').forEach(e => e.remove());
}

// document.addEventListener('mousedown', create );

document.addEventListener('click', e => {
  create(e);
  if((!e.target.classList.contains("q-ignore-element") && QUEUE_COMMENTABLE_STATE) || (e.target.dataset.videomarkerid != undefined)) {
    e.stopPropagation();
    e.preventDefault();
    e.target.blur();
    // $("input:focus").blob()
    Array.from(document.getElementsByTagName('INPUT')).forEach((element) => {
      // console.log("hehe", element);
      element.addEventListener("focus", function(){
        // console.log("focused!")
        element.blur()
      });
    });
  }

  if(e.target.classList.contains("q-ignore-element")){
    window.parent.postMessage({
      execute: "goToComment", 
      videomarkerid: e.target.dataset.videomarkerid
    }, '*');
  }
}, true);

// Execute when you click on elements to create comments. 
function create(event) {
  // TODO: I don't know why two are appearing, but it is. So i added this to remove all but first one. 
  if(document.querySelectorAll("#replayWebsiteVideoMarkerForm").length > 1){
    $('#replayWebsiteVideoMarkerForm').slice(-1).remove();
  }

  // document.querySelectorAll(".ql-editor")[0].innerHTML = "";
  if(QUEUE_COMMENTABLE_STATE && event.button != 2){
    // if(window.parent.document.getElementById("current-user")){
      // toggleDomBorders(true)
      // scroll to that element
      if(event.target.dataset.videomarkerid != null) {
        window.parent.document.getElementById(event.target.dataset.videomarkerid).click()
        if(!$("#replaySideBox").is(":visible")){
          hideSidenav()
        };

        // check if mobile and scroll to the comment if so. 
        if($("#replaySideBoxViewBtn").is(":visible")){
          document.getElementById(event.target.dataset.videomarkerid).scrollIntoView()
        }
      }
      
      if(event.target.tagName === "HTML" && event.clientX >= document.documentElement.offsetWidth) {
        var scrollbarClicked = true; 
        console.log("clicked on scrollbar")
      } else {
        var scrollbarClicked = false;
        console.log("Didn't click on scrollbar")
      }


      if(!event.target.classList.contains("q-ignore-element") && QUEUE_COMMENTABLE_STATE && (event.target.dataset.videomarkerid == null) && (!scrollbarClicked)) {
        // add the circle 
        let id = Math.floor(Math.random() * 10000);
        let rect = event.target.getBoundingClientRect();
        let x = event.clientX - rect.x;
        let y = event.clientY - rect.y;
        
        var element = event.target;
        
        
        document.querySelectorAll('.outline-blue-dashed').forEach(e => e.classList.remove("outline-blue-dashed"));
        document.querySelectorAll('.outline-blue').forEach(e => e.classList.remove("outline-blue"));
        document.querySelectorAll("[data-queuevideomarker]").forEach(e => e.removeAttribute("data-queuevideomarker"));
        event.target.dataset.queuevideomarker = false;
        addCircle(x,y,element, event);
      }
    // } else {
    //   document.getElementById("signedIn").click();
    // }
  }

  // event.stopPropagation();
  // event.preventDefault();
}
window.create = create;

/**
 * Add a circle to the document and return its handle
 */
function addCircle(x,y,element, event) {
  // debugger
  if(element.tagName == "IMG" || element.tagName == "VIDEO") {
    element = element.parentElement;
  }

  if(element.tagName == "svg" || element.tagName == "SVG"){
    element = element.parentElement;
  }
  
  if(element.tagName == "INPUT" || element.tagName == "input"){
    element = element.parentElement;
  }

  if(element.tagName == "FIGURE" || element.tagName == "figure"){
    element = element.parentElement;
  }

  if(element.offsetHeight < 1){
    element = element.parentElement; 
  }
  
  if(getComputedStyle(element).position != "absolute" && element.tagName != "PICTURE") {
    if(getComputedStyle(element).position === "" || element.style.position == ""){
      element.style.position = "relative"
    }
  }

  document.querySelectorAll('.q-circle').forEach(e => e.remove());
  let e = document.createElement('div');
  
  let adjX = x - 20; //click happens in center
  let adjY = y - 20; 

  e.id = "q-circle";
  e.dataset.x = x;
  e.dataset.y = y;
  e.dataset.url = window.location.href;
  e.classList.add("q-circle", "q-ignore-element");
  
  e.style.left = `${adjX}px` 
  e.style.top = `${adjY}px`

  element.appendChild(e);


  // SEND DATA TO PARENT IFRAME START
  // find index 
  var class_list = document.body.querySelector(`[data-queuevideomarker="false"]`).classList.value.replace(/ *\b\S*?:\S*\b/g, '').replace(/\s+/g, '.')
  if(class_list.charAt(0) == ".") {
    var class_list = class_list.replace(/^./, '');
  }
  if(class_list.slice(-1) == ".") {
    var class_list = class_list.slice(0, -1) + ''; // replace last period with a no string 
  }
  var dom_tag = document.body.querySelector(`[data-queuevideomarker="false"]`).tagName
  if(class_list.length > 0 ){
    // we check if the class_list exists. If so, find index with the class name. 
    var element_array = document.querySelectorAll(`${dom_tag}.${class_list}`);
    var elementWithQueueVideoMarker = (element) => element.dataset.queuevideomarker != null;
    var dom_index = Array.from(element_array).findIndex(elementWithQueueVideoMarker);
  } else {
    // otherwise, we use the tag to find the index. This is probably the best method to do instead of the one above, but oh well i guess? 
    var element_array = document.querySelectorAll(document.body.querySelector(`[data-queuevideomarker="false"]`).tagName)
    var elementWithQueueVideoMarker = (element) => element.dataset.queuevideomarker != null;
    var dom_index = Array.from(element_array).findIndex(elementWithQueueVideoMarker);
  }

  window.parent.postMessage({
    execute: "createForm", 
    elementData: {
      class_list: class_list, 
      dom_index: dom_index, 
      dom_tag: dom_tag, 
      screen_size: document.getElementsByTagName("body")[0].offsetWidth, 
      coordinates: {
        x: document.getElementById('q-circle').dataset.x, 
        y: document.getElementById('q-circle').dataset.y, 
        url: document.getElementById('q-circle').dataset.url, 
        scrollFromTop: window.pageYOffset || document.documentElement.scrollTop
      }, 
      eventClientX: event.clientX, 
      eventClientY: event.clientY
    }
  }, '*');
  // SEND DATA TO PARENT IFRAME END 
  return e;
}

/**
  * Add a circle to the document and return its handle
*/
// const addVideoMarkerCircle = (element, video_marker) => {
function addVideoMarkerCircle(element, video_marker) {
  // console.log("addVideoMarkerCircle", video_marker)
  if(element.tagName == "IMG" || element.tagName == "VIDEO") {
    element = element.parentElement;
  }

  if(element.tagName == "svg" || element.tagName == "SVG"){
    element = element.parentElement;
  }

  if(element.tagName == "INPUT" || element.tagName == "input"){
    element = element.parentElement;
  }

  if(element.offsetHeight < 1){
    element = element.parentElement; 
  }

  if(getComputedStyle(element).position != "absolute" && element.tagName != "PICTURE") {
    if(getComputedStyle(element).position === "" || element.style.position == ""){
      element.style.position = "relative"
    }
  }

  let e = document.createElement('div');

  let adjX = video_marker.coordinates.x - 20; //click happens in center
  let adjY = video_marker.coordinates.y - 20; 
  e.id = `video-marker-circle-${video_marker.id}`
  e.dataset.videomarkerid = video_marker.id;
  e.dataset.x = video_marker.coordinates.x;
  e.dataset.y = video_marker.coordinates.y;
  e.classList.add("q-circle-video-marker", "q-ignore-element");
  e.innerHTML = (video_marker.index + 1);
  e.style.left = `${adjX}px` 
  e.style.top = `${adjY}px`

  element.appendChild(e);
  return e;
}

/**
 * check if element is visible in the viewport using standard JS
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Alternative to DOMContentLoaded event
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    toggleQueueCommentable(true);
    
    // Request data from the parent
    window.parent.postMessage("RequestData", "*");

    // Listen for messages from the parent
    window.addEventListener("message", receiveData, false);

    function receiveData(event) {
      // Use the received data
      console.log(event.data); // John
      console.log(QUEUE_COMMENTABLE_STATE);
      if(QUEUE_COMMENTABLE_STATE){
        document.querySelectorAll("body").forEach(e => e.classList.add("comment-cursor"))
      } else {
        document.querySelectorAll("body").forEach(e => e.classList.remove("comment-cursor"))
      }
//       console.log(event.data.age); // 30
    }
  }
};
