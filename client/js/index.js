document.addEventListener('DOMContentLoaded',() =>{
        
    const form = document.getElementById('login-form');

    /** @type {HTMLInputElement} */
    const nama = document.getElementById('name');
    /** @type {HTMLInputElement} */
    const password = document.getElementById('password');
    const js = JSON.parse(sessionStorage.getItem('item'));


    nama.addEventListener('click',() => inssertInput(nama,js.name));
    password.addEventListener('click',()=>inssertInput(password,js.password));

    form.addEventListener('submit',(event) => {
        
        event.preventDefault();
        ambilData(form);
        sessionStorage.clear();

        inssertInput(nama,"");
        inssertInput(password,"");
    });

    function inssertInput (dom,string){
        dom.value = string;
    };

    function ambilData(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const password = formData.get('password');

        if (!name || !password) {
            alert('Nama dan Password harus diisi!');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                name: name,
                password: password,
            })
        })
        .then(response => response.json())
        .then(data => {

            alert(data.message);
            window.location.href = data.redirect;
            
            sessionStorage.setItem('item', JSON.stringify({name, password}));
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat login.');
        });
    };

});
