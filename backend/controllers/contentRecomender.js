const { train } = require('../helpers/trainer');
const { collaborativeFilter } = require('../helpers/cfTrainer');
const { trainCF } = require('../helpers/cfTrainer');
const sampleData = require('../sampleSongs.json');
const { sendErrorResponse, sendSuccessResponse } = require('../helpers/response');
const songsRepo = require('../repositories/songs');

let trainedData = async function () { await train(sampleData, { maxVectorSize: 100, minScore: 0.1 }) };
let trainDataForAllUsers = async function () { await trainCF() };

// trainedData() // Uncomment this line to run train functions
// trainDataForAllUsers(); // Uncomment this line to run train functions for all users


exports.performLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    let user = await songsRepo.findUser({ 'email': email, 'password': password });
    if (user.length) {
        sendSuccessResponse(res, "Login success", 200, user[0]);
    } else {
        sendSuccessResponse(res, "Invalid Credentials", 401);
    }
}

exports.fetchSongsList = async (req, res) => {
    try {
        let songsList = await songsRepo.fetchAllSongs(); //query

        sendSuccessResponse(res, 'Songs List', 200, songsList);
    } catch (error) {
        sendErrorResponse(res, "Something went wrong.", 500)
    }
};

exports.removeFromLikedSongs = async function(req, res) {
    const { user_id, song_id } = req.body;
    console.log(req.body);
    let liked = await songsRepo.removeLikedSongsOfUser({ 'user_id': user_id, 'song_id': song_id });
    try {
        sendSuccessResponse(res, "Remove liked song", 200, liked[0]);
    } catch  (error) {
        sendSuccessResponse(res, "Something went wrong.", 500);
    }
};

exports.addToLikedSongs = async function(req, res) {
    const { user_id, song_id } = req.body;
    console.log(req.body);
    try {
        let liked = await songsRepo.addToLikedSongsOfUser({ 'user_id': user_id, 'song_id': song_id });
        sendSuccessResponse(res, "Add liked song", 200, liked[0]);
    } catch  (error) {
        sendSuccessResponse(res, "Something went wrong.", 500);
    }
};

exports.fetchLikedSongsList = async (req, res) => {
    //console.log("req",req)
    const id = req.query.id;
    //console.log("id",id);
    try {
        let likedSongsList = await songsRepo.fetchAllLikedSongsOfUser(id); //query     

        sendSuccessResponse(res, 'Songs List', 200, likedSongsList);
    } catch (error) {
        sendErrorResponse(res, "Something went wrong.", 500)
    }
};

exports.fetchRecommendation = async (req, res) => {
    console.log("req:",req.body);
    const id = req.body.id;
    const user_id = req.body.user_id;
    console.log("user_id:",user_id);
    try {
        let songsList = await songsRepo.fetchSimilarities(id); //query
        //console.log("songList:",songsList);


        if (songsList.length) {
            let titleSimilarities = JSON.parse(songsList[0].similar_title);
            let releaseSimilarities = JSON.parse(songsList[0].similar_release);
            let titleIds = [];
            let releaseIds = [];

            for (let i = 0; i < titleSimilarities.length; i++) {
                const item = titleSimilarities[i];
                titleIds.push(item.id);
            }

            for (let i = 0; i < releaseSimilarities.length; i++) {
                const item = releaseSimilarities[i];
                releaseIds.push(item.id);
            }

            let titleRecommendations = await songsRepo.fetchSongsFromSimilarities(titleIds); // query
            let releaseRecommendations = await songsRepo.fetchSongsFromSimilarities(releaseIds); // query

            //query for each user by traning
            //let likedRecommendations = await collaborativeFilter(user_id-1); 
            
            //query for each user from database
            let likedRecommendations = await songsRepo.fetchCFrecommendation(user_id); //query for each user from database
            likedRecommendations = JSON.parse(likedRecommendations[0].cfresults);
            
            
            sendSuccessResponse(res, 'Songs List', 200, { titleRecommendations, releaseRecommendations,likedRecommendations});
        } else {
            // let sameYearSongs = await songsRepo.fetchSongsFromSameYear(id);
            sendSuccessResponse(res, "No results found", { titleRecommendations: [], releaseRecommendations: [], similarSongs: sameYearSongs })
        }
    } catch (error) {
        console.log(error);
        sendErrorResponse(res, "Something went wrong.", 500)
    }
}