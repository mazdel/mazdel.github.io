const corsProx = '';//'https://cors-anywhere.herokuapp.com/';
const targetUrl = "https://api.football-data.org/v2/";
const base_url = `${corsProx}${targetUrl}`;
const apiKey = '82e40deba6634183971daff549d55edc';
const OPTIONS = {
    headers:{
        'X-Auth-Token':apiKey
    }
}

// Blok kode untuk melakukan request data json
const getStandings = ()=> {
    fetch_retry(base_url + "competitions/2021/standings",OPTIONS)
        .then(status)
        .then(json)
        .then((data)=> {
            //console.log('fetch ->',data.standings[0].table);
            const dataLength = data.standings[0].table.length;
            // Objek/array JavaScript dari response.json() masuk lewat data.
            // Menyusun komponen card artikel secara dinamis

            //munculin indikator loading
            document.getElementById('loadingData').style.visibility = "visible";
            //inisiasi delay request tiap background data 
            let delay = 0;
            //jumlah penambahan milisecond pada tiap request agar tidak ter-ban oleh penyedia API
            const delayAdd = 5500;

            data.standings[0].table.forEach((standing)=> {
                const teamCrest = standing.team.crestUrl || '/img/foot-ball.jpg';
                const choosenAPI = `teams/`;
                let tableContent = '';
                let favoriteBtn = 'Favorit';
                let teamHTML = "";
                Object.keys(standing).forEach((val)=>{
                    if(val!=='team'){
                        tableContent +=`
                            <tr>
                                <td>
                                    ${val.capitalize()}
                                </td>
                                <td>
                                    ${standing[val]}
                                </td>
                            </tr>
                        `;
                    }
                })
                //request data untuk halaman detail agar hanya melakukan 1x koneksi
                const reqData = () => {
                    fetch_retry(`${base_url}${choosenAPI}${standing.team.id}`,OPTIONS,5,5000)
                    .then(status)
                    .then(json)
                    .then((data)=> {
                        //console.log(`data detail fetch from index`,data);
                    });
                    fetch_retry(`/detail.html?team=${standing.team.id}`,OPTIONS,5,5000)
                    .then(status)
                    .then(json)
                    .then((data)=> {
                        //console.log(`data detail fetch from index`,data);
                    });
                    
                }
                const hideLoading = ()=>{
                    document.getElementById('loadingData').style.visibility = "hidden";
                }
                //request data pada api server dengan berurutan dan diberi delay sebelum request berikutnya agar tidak diblacklist server
                setTimeout(reqData,delay);
                setTimeout(hideLoading, (delayAdd*dataLength)+2000);
                delay +=delayAdd;

                favoriteTeam(standing.team.id).then(isFav=>{
                    if(isFav){
                        favoriteBtn = 'Batal Favorit';
                    }
                    teamHTML += `
                        <div class="card col s12 m12 l6">
                            <div class="card-image waves-effect waves-block waves-light">
                                <img src="${teamCrest}" class="teamCrests activator">
                            </div>
                            <div class="card-content">
                                <span class="card-title activator grey-text text-darken-4">
                                    ${standing.team.name}
                                    <i class="material-icons right">more_vert</i>
                                </span>
                            </div>
                            <div class="card-reveal">
                                <span class="card-title grey-text text-darken-4">
                                Statistik ${standing.team.name}
                                <i class="material-icons right">close</i>
                                </span>
                                <table id="teamStats" class="stripped">
                                    ${tableContent}
                                </table>
                            </div>
                            <div class="card-action">
                                <div class="right-align">
                                    <a href="./detail.html?team=${standing.team.id}" class="left-align">Detail</a>
                                    <!--<a href="#" id="team${standing.team.id}" class="right-align">${favoriteBtn}</a>-->
                                </div>
                            </div>
                        </div>
                        `;        
                    // Sisipkan komponen card ke dalam elemen dengan id #content
                    document.getElementById("teams").insertAdjacentHTML('beforeend',teamHTML);

                });
            });
        })
        .catch(error);

}

const getDetail = ()=> {
    return new Promise((resolve,reject)=>{
        
        const urlParams = new URLSearchParams(window.location.search);
        const getParams = [];
        let choosenAPI;
        urlParams.forEach((value,param)=>{
            getParams.push({param:param,value:value});
        });
        const idParam = getParams[0].value;
        switch (getParams[0].param) {
            case 'team':
                choosenAPI = `teams/`;
                break;
        }
        
        if ("caches" in window) {
            caches.match(`${base_url}${choosenAPI}${idParam}`).then((response)=> {
            if (response) {
                response.json()
                .then((data)=> {
                    let tableContent='',image='',post_title='';
                    switch (getParams[0].param) {
                        case 'team':
                            image = data.crestUrl;
                            post_title=data.name;
                            Object.keys(data).forEach((val)=>{
                                if(val!='id'&&val!='area'&&val!='activeCompetitions'&&val!='squad'&&val!='crestUrl'){
                                    tableContent +=`
                                        <tr>
                                            <td>
                                                ${val.capitalize()}
                                            </td>
                                            <td>
                                                ${data[val]}
                                            </td>
                                        </tr>
                                    `;
                                }
                            })
                            break;
                    }
                    // Menyusun komponen card secara dinamis
                    let detailHTML = `
                        <div class="card">
                        <div class="card-image waves-effect waves-block waves-light">
                            <img src="${image}" />
                        </div>
                        <div class="card-content">
                            <span class="card-title">${post_title}</span>
                            <table id="teamStats" class="stripped">
                                ${tableContent}
                            </table>
                        </div>
                        </div>
                    `;
                    // Sisipkan komponen card ke dalam elemen dengan id #content
                    document.getElementById("body-content").innerHTML = detailHTML;
                    // Kirim objek data hasil parsing json agar bisa disimpan ke indexed db
                    resolve(data);
                });
            }
            });
        }
        fetch_retry(`${base_url}${choosenAPI}${idParam}`,OPTIONS)
        .then(status)
        .then(json)
        .then((data)=> {
            // Objek JavaScript dari response.json() masuk lewat variabel data.
            //console.log(data);
            let tableContent='',image='',post_title='';
            switch (getParams[0].param) {
                case 'team':
                    image = data.crestUrl;
                    post_title=data.name;
                    Object.keys(data).forEach((val)=>{
                        
                        if(val!='id'&&val!='area'&&val!='activeCompetitions'&&val!='squad'&&val!='crestUrl'){
                            tableContent +=`
                                <tr>
                                    <td>
                                        ${val.capitalize()}
                                    </td>
                                    <td>
                                        ${data[val]}
                                    </td>
                                </tr>
                            `;
                        }
                    })
                    break;
            }
            // Menyusun komponen card secara dinamis
            let detailHTML = `
                <div class="card">
                    <div class="card-image waves-effect waves-block waves-light">
                        <img src="${image}" />
                    </div>
                    <div class="card-content">
                        <span class="card-title">${post_title}</span>
                        <table id="teamStats" class="stripped">
                            ${tableContent}
                        </table>
                    </div>
                </div>
            `;
            // Sisipkan komponen card ke dalam elemen dengan id #content
            document.getElementById("body-content").innerHTML = detailHTML;
            // Kirim objek data hasil parsing json agar bisa disimpan ke indexed db
            resolve(data);
        });
    });
}
const getFavs = () =>{
    DB.getFavTeams().then(teams=>{
        //console.log(teams);
        // Menyusun komponen card artikel secara dinamis
        let teamHTML = "";
        if(teams.length==0){
            teamHTML+=`
            <div class="card col s12 m12 l6">
                <div class="card-image waves-effect waves-block waves-light">
                    <img src="img/foot-ball.jpg" class="teamCrests activator">
                </div>
                <div class="card-content">
                    <span class="card-title activator grey-text text-darken-4">
                        Tidak ada data
                        <i class="material-icons right">more_vert</i>
                    </span>
                </div>
                <div class="card-reveal">
                    <span class="card-title grey-text text-darken-4">
                    Nampaknya kamu belum memiliki tim favorit
                    <i class="material-icons right">close</i>
                    </span>
                    <table id="teamStats" class="stripped">
                        
                    </table>
                </div>
                <div class="card-action">
                    <div class="right-align">
                        
                    </div>
                </div>
            </div>
            `
        }
        else{
            teams.forEach((team)=> {
                const teamCrest = team.crestUrl || '/img/foot-ball.jpg';
                let tableContent = '';
                /*
                Object.keys(team).forEach((val)=>{
                    if(val!=='team'){
                        tableContent +=`
                            <tr>
                                <td>
                                    ${val.capitalize()}
                                </td>
                                <td>
                                    ${team[val]}
                                </td>
                            </tr>
                        `;
                    }
                })
                */
                teamHTML += `
                    <div class="card col s12 m12 l6">
                        <div class="card-image waves-effect waves-block waves-light">
                            <img src="${teamCrest}" class="teamCrests activator">
                        </div>
                        <div class="card-content">
                            <span class="card-title activator grey-text text-darken-4">
                                ${team.name}
                                <i class="material-icons right">more_vert</i>
                            </span>
                        </div>
                        <div class="card-reveal">
                            <span class="card-title grey-text text-darken-4">
                            Statistik ${team.name}
                            <i class="material-icons right">close</i>
                            </span>
                            <table id="teamStats" class="stripped">
                                ${tableContent}
                            </table>
                        </div>
                        <div class="card-action">
                            <div class="right-align">
                                <a href="./detail.html?team=${team.id}" class="left-align">Detail</a>
                            </div>
                        </div>
                    </div>
                    `;
                });
        }
        // Sisipkan komponen card ke dalam elemen dengan id #body-content
        document.getElementById("favorites").innerHTML = teamHTML;
    });
}
