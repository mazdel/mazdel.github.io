//fetch helper
// Blok kode yang akan di panggil jika fetch berhasil
const status = (response) => {
    if (response.status !== 200) {
        console.error("Error : " + response.status);
        // Method reject() akan membuat blok catch terpanggil
        return Promise.reject(new Error(response.statusText));
    } else {
        // Mengubah suatu objek menjadi Promise agar bisa "di-then-kan"
        return Promise.resolve(response);
    }
}
// Blok kode untuk memparsing json menjadi array JavaScript
const json = (response) => {
    
    return response.json();
}
// Blok kode untuk meng-handle kesalahan di blok catch
const error = (error)=> {
    // Parameter error berasal dari Promise.reject()
    console.log("Error : " + error);
}
const fetch_retry = async (url,options,attempts=2,delay=2000)=>{
    try{
        return await fetch(url,options)
    }catch(error){
        if(attempts<=1) throw error;
        console.log(`retry to fetch with ${attempts} attempts`);
        return setTimeout(fetch_retry(url,options,attempts-1,delay),delay);
    }
}
//db helper
// cek apakah sudah favorite apa belum
const favoriteTeam = async (id=0)=>{
    const favTeams = await DB.getFavTeams();
    //console.log('fav',favTeams);
    let result = false;
    favTeams.forEach((team,key)=>{
        if(team.id==id){
            result = true;
        }
    });
    return result;
}

//push notif helper
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
// Register service worker
const registerServiceWorker = async ()=> {
    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Registrasi service worker berhasil.');
        return registration;
    }
    catch (err) {
        console.error('Registrasi service worker gagal.', err);
    }
}
const requestPermission = ()=>{
    if('Notification' in window){
        Notification.requestPermission().then(result=>{
            if(result==='denied'){
                console.log("notifikasi tidak diizinkan.");
                return;
            }else if(result==='default'){
                console.error('user menutup dialog izin notifikasi');
                return
            }
            if(('PushManager' in window)){
                navigator.serviceWorker.getRegistration().then(registration =>{
                    registration.pushManager.subscribe({
                        userVisibleOnly:true,
                        applicationServerKey:urlBase64ToUint8Array('BCH-2-ZwHie2yQ111oeV9AOReVCh_2x6O1JCudiSdSLiY2-FuOyrGRSEDhDm8eLD7c_4ZCMKuQXS7O8LAsYXMXQ')
                    })
                    .then(subscribe=>{
                        console.log('Berhasil melakukan subscribe dengan endpoint: ', subscribe.endpoint);
                        console.log('Berhasil melakukan subscribe dengan p256dh key: ', btoa(String.fromCharCode.apply(null, new Uint8Array(subscribe.getKey('p256dh')))));
                        console.log('Berhasil melakukan subscribe dengan auth key: ', btoa(String.fromCharCode.apply(null, new Uint8Array(subscribe.getKey('auth')))));
                    })
                    .catch(e=>{
                        console.error('Tidak dapat melakukan subscribe ', e.message);
                    })
                });
            }
        })
    }
}

