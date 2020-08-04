String.prototype.capitalize = function() {
    if(this.length<4){
        return this.toUpperCase();
    }
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//menambahkan sesi agar lazyloader/splash screen tidak berulang
let isAlreadyHere = sessionStorage.getItem('isHere');
if(!isAlreadyHere){
    sessionStorage.setItem('isHere',true);
}else{
    $('#lazyLoader').hide();
}
document.getElementById('loadingData').style.visibility = "hidden";
document.addEventListener("DOMContentLoaded", () => {
    //remove lazyloader/splash screen
    setTimeout(()=>{
        $('#lazyLoader').fadeOut(3000);
    },12000);
    
    // Activate sidebar nav
    //console.log('calling =>',TimePicker());
    const path = window.location.pathname.substr(1);
    if(path==`detail.html`){console.log('accessed detail');return};
    const elems = document.querySelectorAll(".sidenav");
    M.Sidenav.init(elems);
    moment.locale('id');
    loadNav();
    
    function loadNav() {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status != 200) return;

            // Muat daftar tautan menu
            document.querySelectorAll(".topnav, .sidenav").forEach(elm=> {
            elm.innerHTML = xhttp.responseText;
            });
            // Daftarkan event listener untuk setiap tautan menu
            document.querySelectorAll(".sidenav a, .topnav a").forEach(elm=> {
                elm.addEventListener("click", event=> {
                // Tutup sidenav
                let sidenav = document.querySelector(".sidenav");
                M.Sidenav.getInstance(sidenav).close();
        
                // Muat konten halaman yang dipanggil
                page = event.target.getAttribute("href").substr(1);
                loadPage(page);
                });
            });
        }
        };
        xhttp.open("GET", "nav.html", true);
        xhttp.send();
    }
//inisiasi materialize timepicker
    const TimePicker = ()=>{
        const elems = document.querySelectorAll('.timepicker');
        M.Timepicker.init(elems, {
            twelveHour:false
        });
    }


//agar tombol baca dapat berfungsi
    const read_more = () =>{
        const elems = document.querySelectorAll('div.card-action a');
        elems.forEach(elem=>{
            elem.addEventListener('click',event=>{
                page = event.target.getAttribute("href").substr(1);
                loadPage(page);
            });
        });
    }
// Load page content
    let page = window.location.hash.substr(1);
    if (page == "") {page = "home"};
    loadPage(page);
    function loadPage(page) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
        let content = document.querySelector("#body-content");
        if (this.status == 200) {
            content.innerHTML = xhttp.responseText;
            
            switch(page){
                //memanggil fungsi read_more hanya untuk halaman beranda
                case `home`:
                    getStandings();
                    read_more();
                    break;
                case `favorite`:
                    getFavs();
                    break;
            }
            //memanggil fungsi tombol favorite ketika me-load halaman
            //favorite_btn();
        } else if (this.status == 404) {
            content.innerHTML = "<p>Halaman tidak ditemukan.</p>";
        } else {
            content.innerHTML = "<p>Ups.. halaman tidak dapat diakses.</p>";
        }
        }
    };
    xhttp.open("GET", "pages/" + page + ".html", true);
    xhttp.send();
    }
    
});