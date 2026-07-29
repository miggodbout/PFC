var ROOT_FOLDER_ID = '1-eJRDVcj7CrGM02XE-gXs_EU4YdazdYg';
var NTFY_TOPIC     = 'pfc-mg-uploads';

function doPost(e) {
  try {
    var data     = JSON.parse(e.postData.contents);
    var jobsite  = (data.jobsite || 'Unknown-Job').toString().trim();
    var unit     = (data.unit    || 'Unknown').toString().trim();
    var imageB64 = data.image;

    // Floor from first digit of unit number
    var floor = 'Floor-' + unit.charAt(0);

    // Date string — e.g. "26-06-04"
    var dateStr = Utilities.formatDate(
      new Date(), Session.getScriptTimeZone(), 'yy-MM-dd'
    );

    // Build folder structure
    var root        = DriveApp.getFolderById(ROOT_FOLDER_ID);
    var jobFolder   = getOrCreate(root,        jobsite);
    var floorFolder = getOrCreate(jobFolder,   floor);
    var unitFolder  = getOrCreate(floorFolder, 'Unit-' + unit);

    // Filename with duplicate handling
    var baseName = dateStr + '_Unit' + unit;
    var filename = baseName + '.jpg';
    var counter  = 1;
    while (unitFolder.getFilesByName(filename).hasNext()) {
      filename = baseName + '_' + (counter < 10 ? '0' + counter : counter) + '.jpg';
      counter++;
    }

    // Save photo
    var blob = Utilities.newBlob(Utilities.base64Decode(imageB64), 'image/jpeg', filename);
    unitFolder.createFile(blob);

    // ── Push notification via ntfy ──────────────────────────────────────────
    try {
      UrlFetchApp.fetch('https://ntfy.sh/' + NTFY_TOPIC, {
        method:  'post',
        headers: {
          'Title':   'PFC — New Photo',
          'Tags':    'camera',
          'Priority': 'default'
        },
        payload: 'Unit ' + unit +
                 ' · Floor ' + unit.charAt(0) +
                 ' · ' + jobsite.replace(/-/g, ' ') +
                 '\n' + filename
      });
    } catch (ntfyErr) {
      // Notification failed silently — upload still succeeds
    }

    return respond({ success: true, filename: filename });

  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function getOrCreate(parent, name) {
  var iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('PFC Project Log — Active');
}