$(document).ready(function () {
 
    // Adding file --------------------------------------------------------------------------------
        jQuery.validator.addMethod("vldFileFrmt", function (val, element) {
        var inputElement = document.getElementById('formFile');
        var docName = document.getElementById('docName');
        var files = inputElement.files;
        var filename = files[0].name;
        var extension = filename.substr(filename.lastIndexOf("."));
        /* define allowed file types */
        var allowedExtensionsRegx = /(\.xls|\.xlsx|\.docx|\.pptx|\.doc|\.pdf)$/i;
        /* testing extension with regular expression */
        var isAllowed = allowedExtensionsRegx.test(extension);         

        if(!isAllowed){  
        inputElement.value = "";
        docName.value = "";
        return false;
        }else{  
        $("#docName-error").hide();      
        $('#docName-error').addClass('rmcls').removeClass('error');         
        return true;
        }        

    }, "Invalid File Type.Please choose .xlsx , .pdf, .docx , .pptx format.");
   
    jQuery.validator.addMethod("vldFileSize", function (val, element) {
        var inputElement = document.getElementById('formFile');
        var docName = document.getElementById('docName');
        var files = inputElement.files;
        var fileSize = files[0].size;
        var size = Math.round((fileSize / 1024));       
        if(size >= 2*1024){  
        inputElement.value = "";
        docName.value = "";
        return false;
        }else{  
        $("#docName-error").hide();      
        $('#docName-error').addClass('rmcls').removeClass('error');         
        return true;
        }        
    }, "Invalid file size, please select a file less than or equal to 2mb size.");

    jQuery.validator.addMethod("rlsCheckDecimal", function (val, element) {
        var decimal  = /^[-+]?[0-9]+\.[0-9]+$/; 
        var inputtxt = document.getElementById("relsVer");
        if(!inputtxt.value.match(decimal)) 
        {                   
            return false;
        }else{
            return true;
        }                 
    }, "Invalid input , Please enter valid decimal number.");
   
    jQuery.validator.addMethod("docCheckDecimal", function (val, element) {
        var decimal  = /^[-+]?[0-9]+\.[0-9]+$/; 
        var inputtxt = document.getElementById("docVer");
        if(!inputtxt.value.match(decimal)) 
        {                   
            return false;
        }else{
            return true;
        }                 
    }, "Invalid input , Please enter valid decimal number.");

    $('.valdAddFile').validate({       
        rules: {
            docname: {       
                required: true
            },
            doc_file: {       
                required: true,
                vldFileFrmt: true,
                vldFileSize: true       
            },
            docDesc: {       
                required: true
            },
            relsVer: {       
                required: true,
                rlsCheckDecimal : true
            },
            docVer: {       
                required: true,
                docCheckDecimal: true
            },
            rlsDate: {       
                required: true
            },
        
        },   
        messages: {
            docname: {
                required: 'Please enter a file name.',
            },   
            doc_file: {
                required: 'Please choose a file.',                
            },  
            relsVer: {
                required: 'Please enter release version.',
            }, 
            docDesc: {
                required: 'Please enter description.',
            }, 
            docVer: {
                required: 'Please enter document version.',
            },
            rlsDate: {
                required: 'Please enter release date.',                
            },
        },   
    });

    $(".btn-danger").click(function() {
        $("label.error").hide();
        $(".error").removeClass("error");
    });


    // Updating file ----------------------------------------------------------------------------- 
    jQuery.validator.addMethod("vldFileFrmtUpd", function (val, element) {
        var inputElement = document.getElementById('selectedFile');
        var fakeInput = document.getElementById('fakeInput');   
        var docName = document.getElementById('editDocName');
        var files = inputElement ? inputElement.files : null;
        if (!files || files.length === 0) {
            return true;
        }
        var filename = files[0].name;
        var extension = filename.substr(filename.lastIndexOf("."));
        /* define allowed file types */
        var allowedExtensionsRegx = /(\.xls|\.xlsx|\.docx|\.pptx|\.doc|\.pdf)$/i;
        /* testing extension with regular expression */
        var isAllowed = allowedExtensionsRegx.test(extension);         

        if(!isAllowed){  
        inputElement.value = "";
        docName.value = "";
        fakeInput.value = "";
        return false;
        }else{  
        $("#editDocName-error").hide();      
        $('#editDocName-error').addClass('rmcls').removeClass('error');         
        return true;
        }        

    }, "Invalid File Type.Please choose .xlsx , .pdf, .docx , .pptx format.");

    jQuery.validator.addMethod("rlsCheckDecimalUpdt", function (val, element) {
        var decimal  = /^[-+]?[0-9]+\.[0-9]+$/; 
        var inputtxt = document.getElementById("relsVerDoc");
        if(!inputtxt.value.match(decimal)) 
        {                   
            return false;
        }else{
            return true;
        }                 
    }, "Invalid input , Please enter valid decimal number.");

    jQuery.validator.addMethod("docCheckDecimalUdt", function (val, element) {
        var decimal  = /^[-+]?[0-9]+\.[0-9]+$/; 
        var inputtxt = document.getElementById("docVerUpd");
        if(!inputtxt.value.match(decimal)) 
        {                   
            return false;
        }else{
            return true;
        }                 
    }, "Invalid input , Please enter valid decimal number.");
   
    jQuery.validator.addMethod("fileChkVld", function (val, element) {      
        var inputtxt = document.getElementById("fakeInput");
        if(inputtxt.value == "") 
        {                   
            return false;
        }else{
            return true;
        }                 
    }, "Please chose a file.");

    $('.valdUpdtFile').validate({       
        rules: {
            docname: {       
                required: true
            },
            new_doc: {                 
                fileChkVld:true ,                     
                vldFileFrmtUpd: true                             
            },
         
            docDesc: {       
                required: true
            },
            relsVer: {       
                required: true,
                rlsCheckDecimalUpdt : true
            },
            docVer: {       
                required: true,
                docCheckDecimalUdt: true
            },
            rlsDate: {       
                required: true
            },
            changeComment: {
                required: true,
                minlength: 3
            },
            bumpType: {
                required: true
            }
        
        },   
        messages: {
            docname: {
                required: 'Please enter a file name.',
            },                      
            relsVer: {
                required: 'Please enter release version.',
            }, 
            docDesc: {
                required: 'Please enter description.',
            }, 
            docVer: {
                required: 'Please enter document version.',
            },
            rlsDate: {
                required: 'Please enter release date.',                
            },
            changeComment: {
                required: 'Please enter what changed and why.',
                minlength: 'Please enter a short change comment.'
            }
        },   
    });

});