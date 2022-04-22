const navSlide = ()=>{
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const body= document.querySelector("body");

    
    burger.addEventListener('click', ()=>{
        //Toggle Nav
        nav.classList.toggle('nav-active');

        //Animate links
        navLinks.forEach((link, index) => {
            if(link.style.animation){
                link.style.animation='';
                body.style.overflow = "auto";
            }
            else{
                link.style.animation = `navLinkFade 0.5s ease forwards ${index /20}s`;
                body.style.overflow = "hidden";
            }
        });

        //Burger animations
        burger.classList.toggle('toggle');
    })

}
navSlide();

//Hover animation for burger
$(document).on('mouseenter', '.block', function() {
    var that = $(this);
    that.removeClass('nearTarget').addClass('target');
    $('.block').not(this).addClass('nearTarget').removeClass('target');
  }).on('mouseleave', '.block', function() {
    var that = $(this);
    $('.block').removeClass('nearTarget target');
})

//Dark mode
    const colorSwitch = document.getElementById("color-switch");

    colorSwitch.addEventListener('change', ()=>{
        document.body.classList.toggle('dark');

        if(localStorage.getItem("theme") == "light"){
            localStorage.setItem('theme','dark');
        }
        else{
            localStorage.setItem('theme','light');
        }
    })

    if(localStorage.getItem("theme") == "light"){
        document.body.classList.remove('dark');
    }
    else if(localStorage.getItem("theme") == "dark"){
        document.body.classList.toggle('dark');
    }
    else {
        localStorage.setItem('theme','light');
}

//Start animations :(



