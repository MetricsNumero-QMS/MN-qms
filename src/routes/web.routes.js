const express = require('express')
const router = express.Router()
const homeController =   require('../controllers/home.controller');
const folderController = require('../controllers/folder.controller');
const versionController = require('../controllers/version.controller');
const accessController = require('../controllers/access.controller');
var ssn;
//---------------------------------------------WEB ROUTES-----------------------------------------//
//router.get('/', homeController.home);
router.get('/', homeController.login);
router.get('/home', homeController.home);
router.get('/library', homeController.library);
router.get('/pgred/:page/:page1', function(req,res){     
    var menu = req.params.page;    
    var submenu = req.params.page1;
    //console.log(menu);     
    if(menu == 'Home'){
        return res.send({result: 'redirect', url:'/'})  
    }else if(menu == 'Aboutqms'){
        return res.send({result: 'redirect', url:'/about'})
    }else if(menu == 'Us'){
        return res.send({result: 'redirect', url:'/contact'})
    }else if(menu == 'Viewprofile'){
        return res.send({result: 'redirect', url:'/userProfile'})
    }else if(menu == 'Exituserprofile'){
        return res.send({result: 'redirect', url:'/logout'})    
    }else{
        ssn = req.session;
        ssn.menu = req.params.page;
        ssn.submenu = req.params.page1;
        //return res.send({result: 'redirect', url:'/category'})
        return res.send({result: 'redirect', url:'/category/'+menu+'/'+submenu})        
    }    
});
router.get('/login', homeController.login);
router.post('/signin', homeController.signin);
router.get('/logout', homeController.logout);
//router.get('/category', homeController.fileList);
router.get('/about', homeController.about);
router.get('/contact', homeController.contact);
router.get('/userProfile', homeController.userProfile);
router.post('/userProfile', homeController.updateUserProfile);
router.get('/paswdChange', homeController.paswdChange);
router.post('/changePassword', homeController.changePassword);
router.get('/category', homeController.category);
router.get('/releaseNote', homeController.releaseNote);
router.get('/importUser', homeController.importUser);
router.post('/addUser', homeController.addUser);
router.post('/signup', homeController.signup);
router.post('/forgot-password', homeController.forgotPassword);
router.get('/reset-password/:token', homeController.resetPasswordForm);
router.post('/reset-password/:token', homeController.resetPassword);
router.post('/importUserDb', homeController.uploadDoc.single('importuser_file'),homeController.importUserDb);
router.get('/downloadTmplt', homeController.downloadTmplt);
// router.get('/category', homeController.category);
//-------------------File System starts here--------------------------------------------------------//
// router.get('/charterhr', homeController.charterhr);
router.post('/uploadDocument/:menu/:submenu', homeController.uploadDoc.single('doc_file'), homeController.uploadDocument);
// router.get('/deleteDocument/:menu/:submenu/:doc_id', homeController.deleteDocument);
router.get('/deleteDocument', homeController.deleteDocument);
router.post('/getData', homeController.getData);
router.post('/editDocument/:menu/:submenu', homeController.uploadDoc.single('new_doc'),homeController.editDocument);
// router.post('/editDocument/:menu/:submenu',homeController.editDocument);
router.post('/insertLogDet', homeController.insertLogDet);
router.post('/insertNotification', homeController.insertNotification);
router.get('/downloadDocument/:menu/:submenu/:doc_name', homeController.downloadDoc);
router.get('/previewDocument/:menu/:submenu/:doc_name', homeController.previewDocument);
router.get('/versions/:docId', versionController.list);
router.get('/versions/:docId/:versionId/preview', versionController.preview);
router.get('/versions/:docId/:versionId/download', versionController.download);
router.post('/versions/:docId/:versionId/restore', versionController.restore);
//-------------------charterHR ends here--------------------------------------------------------//
router.get('/charterAdmin', homeController.charterAdmin);
router.get('/folders', folderController.list);
router.get('/folders/destinations', folderController.destinations);
router.post('/folders/transfer', folderController.transfer);
router.post('/library/documents/:docNum/update', folderController.updateLibraryDocument);
router.post('/library/documents/:docNum/share-mail', folderController.shareLibraryDocument);
router.get('/share/file/:token', folderController.openFileShare);
router.post('/folders/:id/invite', folderController.inviteMember);
router.post('/library/invite', folderController.inviteLocation);
router.get('/invite/folder/:token', folderController.openFolderInvite);
router.post('/library/documents/:docNum/delete', folderController.removeLibraryDocument);
router.post('/library/rename', folderController.renameItem);
router.post('/library/duplicate', folderController.duplicateItem);
router.post('/library/upload', folderController.locationUpload.single('doc_file'), folderController.uploadToLocation);
router.post('/library/restore', folderController.restoreItem);
router.post('/library/purge', folderController.purgeItem);
router.post('/library/location/delete', folderController.removeLocation);
router.post('/folders', folderController.create);
router.get('/folders/users', folderController.users);
router.get('/folders/documents', folderController.categoryDocuments);
router.get('/folders/shared/:token', accessController.openShared);
router.post('/folders/shared/:token', accessController.redeemShared);
router.get('/folders/:id', folderController.detail);
router.post('/folders/:id', folderController.update);
router.post('/folders/:id/delete', folderController.remove);
router.post('/folders/:id/permissions', folderController.grantPermission);
router.post('/folders/:id/permissions/:permId/revoke', folderController.revokePermission);
router.post('/folders/:id/shares', folderController.share);
router.post('/folders/:id/shares/:shareId/revoke', folderController.revokeShare);
router.get('/folders/:id/access', accessController.panel);
router.post('/folders/:id/groups', accessController.grantGroup);
router.post('/folders/:id/groups/:grantId/revoke', accessController.revokeGroup);
router.post('/folders/:id/templates/:templateId/apply', accessController.applyTemplate);
router.post('/folders/:id/inherit', accessController.setInherit);
router.post('/folders/:id/access-requests', accessController.requestAccess);
router.post('/folders/:id/access-requests/:requestId/decide', accessController.decideRequest);
router.post('/folders/:id/links', accessController.createLink);
router.post('/folders/:id/links/:linkId/revoke', accessController.revokeLink);
router.post('/folders/:id/recertify', accessController.recertify);
router.get('/access/alerts', accessController.alerts);
router.post('/access/alerts/:id/read', accessController.readAlert);
router.get('/access/meta', accessController.meta);
router.get('/access/requests', accessController.pending);
router.post('/folders/:id/lifecycle', folderController.changeLifecycle);
router.post('/folders/:id/upload', folderController.folderUpload.single('doc_file'), folderController.uploadToFolder);
router.post('/folders/:id/documents', folderController.addDocuments);
router.post('/folders/:id/documents/:docNum/remove', folderController.removeDocument);
module.exports = router