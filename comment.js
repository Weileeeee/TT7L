const showContainers = document.querySelectorAll(".show-replies");

showContainers.forEach((btn) =>
 btn.addEventListener("click",(e) => {
    let parentContainer = e.target.closest(".comment_container");
    let _id = parentContainer.id;
    if(_id) {
        let childrencontainer = parentContainer.querySelectorAll(
            `[dataset=${_id}]`
        );
        childrencontainer.forEach((child) => child.classList.toggle("opened"))
    }
 })
 );