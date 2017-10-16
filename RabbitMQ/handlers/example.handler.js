module.exports = function(data){
    // Handle message here
    switch (typeof data){
        case 'object':
            console.log(`Get message ${data.message}`);
            break;
        default:
            console.log('message cant sign!!');
    }
}