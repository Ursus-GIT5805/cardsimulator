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

const compressStr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function compressPeerID(id){
    let p62 = [1];
    for(let i = 0 ; i < 8 ; ++i) p62.push( p62[i]*62 );

    let out = [], cur = 0;
    for(let i = 0 ; i <= id.length ; ++i){
        if(id[i] == '-' || i == id.length){
            for(let j = p62.length-1 ; j >= 0 ; --j){
                out.push( compressStr[ Math.floor(cur / p62[j]) ] );
                cur = cur % p62[j];
            }

            if(i != id.length) out.push('-');
            continue;
        }

        cur = cur * 16;
        cur += parseInt(id[i], 16)
    }

    let sout = "";
    let start = true;
    for(let i = 0 ; i < out.length ; ++i){
        if(out[i] == '-'){
            start = true;
            sout += '-';
            continue;
        }
        if(out[i] == '0' && start) continue;

        sout += out[i];
        start = false;
    }

    return sout;
}

function encodePeerID(id){
    let nums = [], cur = 0;
    for(let i = 0 ; i <= id.length ; ++i){
        if(id[i] == '-' || i == id.length){
            nums.push(cur);
            cur = 0;
            continue;
        }

        cur *= 62;
        cur += compressStr.indexOf(id[i]);
    }

    let sizes = [8, 4, 4, 4, 12];
    let out = "";
    for(let i = 0 ; i < nums.length ; ++i){
        out += nums[i].toString(16).padStart(sizes[i], '0');
        if(i+1 < nums.length) out += "-";
    }

    return out;
}
