import dispatcher from '../appdispatcher';
import {ILoginErrors, ICredential} from "../stores/loginstore";

export default {
    initApi(api: any): void {
        dispatcher.dispatch('initApi', api);
    },
    setCurrentChatThread(chatThread: string): void {
        dispatcher.dispatch('setCurrentChatThread', chatThread);
    },
    friendSelected(friend: any): void {
        dispatcher.dispatch('friendSelected', friend);
    },
    markAsRead(threadID: string) {
        dispatcher.dispatch("markAsRead", threadID);
    },
    sendMessage(threadID: string, message: any) {
        console.log("chatAction: sendMessage : %s, %o", threadID, message);
        dispatcher.dispatch("sendMessage", {threadID, message});
    },
    sendTypingIndicator(threadID: string) {
        console.log("chatAction: sendTypingIndicator : %so", threadID);
        dispatcher.dispatch("sendTypingIndicator", threadID);
    },
    endTypingIndicator(threadID: string) {
        console.log("chatAction: endTypingIndicator : %so", threadID);
        dispatcher.dispatch("endTypingIndicator", threadID);
    },
    filterFriendList(filterText: string){
        console.log("chatAction: filterFriendList : %s", filterText);
        dispatcher.dispatch("filterFriendList", filterText);
    },
    enqueueLikeSticker(threadID: string, stickerID: number){
        console.log("chatAction: enqueueLikeSticker : %s, %d", threadID, stickerID);
        dispatcher.dispatch("enqueueLikeSticker", {threadID, stickerID});
    },
    finalizeLikeSticker(threadID: string, stickerID: number){
        console.log("chatAction: finalizeLikeSticker : %s, %d", threadID, stickerID);
        dispatcher.dispatch("finalizeLikeSticker", {threadID, stickerID});
    },
    showImage(imageInfo: any){
        dispatcher.dispatch("showImage", imageInfo);
    },
    playNewMessageBeep() {
        dispatcher.dispatch("playNewMessageBeep", true);
    },
    resetPlayNewMessageBeep() {
        dispatcher.dispatch("playNewMessageBeep", false);
    }
};
