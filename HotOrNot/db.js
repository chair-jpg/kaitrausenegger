const DB_KEY_SHOWS = 'art_shows_v3';
const DB_KEY_VOTES = 'art_votes_v3';

if (!localStorage.getItem(DB_KEY_SHOWS)) {
    const dummyShows = [
        { id: '1', title: '(Solo) Jeff Koons: Porcelain Series - Gagosian', token: 'demo123', createdAt: Date.now(), active: true },
        { id: '2', title: '(Solo) Marianna Simnett: Circus - Secession', token: 'demo456', createdAt: Date.now() - 86400000, active: true },
        { id: '3', title: '(Solo) Max Mustermann - Sk8ting 4 life - MUMOK', token: 'demo789', createdAt: Date.now() - 172800000, active: true }
    ];
    localStorage.setItem(DB_KEY_SHOWS, JSON.stringify(dummyShows));
    
    localStorage.setItem(DB_KEY_VOTES, JSON.stringify([]));
}

window.DB = {
    getShows: function() { return JSON.parse(localStorage.getItem(DB_KEY_SHOWS) || '[]'); },
    addShow: function(title) {
        const shows = this.getShows();
        const id = Date.now().toString();
        const token = Math.random().toString(36).substring(2, 10);
        const newShow = { id, title, token, createdAt: Date.now(), active: true };
        shows.push(newShow);
        localStorage.setItem(DB_KEY_SHOWS, JSON.stringify(shows));
        return newShow;
    },
    getShowByToken: function(token) { return this.getShows().find(s => s.token === token && s.active); },
    getShowById: function(id) { return this.getShows().find(s => s.id === id); },
    getVotes: function() { return JSON.parse(localStorage.getItem(DB_KEY_VOTES) || '[]'); },
    addVote: function(voteData) {
        const votes = this.getVotes();
        // Removed email deduplication check so you can submit multiple test votes
        votes.push({ ...voteData, id: Date.now().toString(), submittedAt: Date.now() });
        localStorage.setItem(DB_KEY_VOTES, JSON.stringify(votes));
    },
    getShowAverages: function() {
        const shows = this.getShows();
        const votes = this.getVotes();
        
        return shows.map(show => {
            const showVotes = votes.filter(v => v.showId === show.id);
            const count = showVotes.length;
            
            if (count === 0) {
                return { ...show, count: 0, averages: null, overallAvg: 0 };
            }
            
            const sums = { satisfaction: 0, relevance: 0, instagramable: 0, sellable: 0, cool: 0 };
            showVotes.forEach(v => {
                sums.satisfaction += parseInt(v.satisfaction) || 0;
                sums.relevance += parseInt(v.relevance) || 0;
                sums.instagramable += parseInt(v.instagramable) || 0;
                sums.sellable += parseInt(v.sellable) || 0;
                sums.cool += parseInt(v.cool) || 0;
            });
            
            const averages = {
                satisfaction: (sums.satisfaction / count).toFixed(1),
                relevance: (sums.relevance / count).toFixed(1),
                instagramable: (sums.instagramable / count).toFixed(1),
                sellable: (sums.sellable / count).toFixed(1),
                cool: (sums.cool / count).toFixed(1)
            };
            
            const overallAvg = ((
                parseFloat(averages.satisfaction) + 
                parseFloat(averages.relevance) + 
                parseFloat(averages.instagramable) + 
                parseFloat(averages.sellable) + 
                parseFloat(averages.cool)
            ) / 5).toFixed(1);
            
            return { ...show, count, averages, overallAvg };
        }).sort((a, b) => b.overallAvg - a.overallAvg);
    }
};
