function SRGBtoHEX(s){
    let ind = 0;
    let v = [0, 0, 0];
    for(let i = 4 ; i < s.length ; ++i){
        if(s[i] == ',') ind++;
        else if('0' <= s[i] && s[i] <= '9') {
            v[ind] *= 10;
            v[ind] += s[i]-'0';
        }
    }
    return "#" + (1 << 24 | v[0] << 16 | v[1] << 8 | v[2]).toString(16).slice(1);
}
