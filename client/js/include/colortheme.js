function getRGBValues(cssVariable) {
    // Ambil nilai dari variabel CSS
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();

    // Jika dalam format "rgb(angka, angka, angka)", ekstrak angka dengan regex
    if (value.startsWith("rgb")) {
        const match = value.match(/\d+/g);
        return match ? match.map(Number) : [0, 0, 0]; // Konversi ke array angka
    }

    // Jika hanya "angka, angka, angka", pisahkan dengan koma
    return value.split(',').map(Number);
};

function setBackgroundColor(refer, value, ...arg){
    if (!(refer instanceof Array && value instanceof Array))
        return;

    if (refer.length ==! value.length)
        return;

    for (let index = 0; index < refer.length; index++) {
        let newval = refer[index] + arg[index];

        if(newval > 255)
            continue;
        else if(newval < 0)
            continue;
        else
            value[index] = newval;
    }

    return value;
};

const keycss = ['--background-color','--box-color','--input-line-color'];
const cssKeyPair = new Map();

keycss.forEach((key) => {
    cssKeyPair.set(key, getRGBValues(key));
});

cssKeyPair.forEach((value,key) => {

    switch (key) {
        case keycss[0]:
            return;
        case keycss[1]:
            value = setBackgroundColor(cssKeyPair.get(keycss[0]),value, 113, 227, 189);
            return;
        case keycss[2]: 
            value = setBackgroundColor(cssKeyPair.get(keycss[0]),value, 52, 61, 60);
            return;
    }
});

document.addEventListener('DOMContentLoaded',() => {
    document.documentElement.style.setProperty(keycss[1], `${(cssKeyPair.get(keycss[1])).join(', ')}`);
    document.documentElement.style.setProperty(keycss[2], `rgb(${(cssKeyPair.get(keycss[2])).join(', ')})`);
});
