// Google Apps Script for Auto-Grading Quiz and Sending YouthMappers Certificates
// Form ID: 1luEms8em1u4P-AfHNFUeqsq_CYfds_UJZPFLGy6XL7A
// Certificate Template ID: 199GtrUU0UA8Iv1_FNZ2CbtjCzx4wfYm8 (original)  1zWBGq39IwAGZa8dmqYyfGkBWEBeaWJ9g (4:3 ratio)


function onFormSubmit(e) {
  console.log('Form submitted! Processing response...');
  
  try {
    // Get your specific form by ID
    const form = FormApp.openById('1luEms8em1u4P-AfHNFUeqsq_CYfds_UJZPFLGy6XL7A');
    
    // Use the event parameter if available, otherwise get latest response
    let formResponse;
    if (e && e.response) {
      formResponse = e.response;
      console.log('Using response from event trigger');
    } else {
      const responses = form.getResponses();
      formResponse = responses[responses.length - 1];
      console.log('Using latest response (manual trigger)');
      
      // For manual testing, always process
      // But for time-based triggers, we need to prevent duplicates
      if (!e) {
        // Check if this is a manual call by looking at the stack
        const currentTime = new Date().getTime();
        const lastProcessTime = PropertiesService.getScriptProperties().getProperty('lastProcessTime');
        
        if (lastProcessTime && (currentTime - parseInt(lastProcessTime)) < 30000) {
          console.log('Response already processed recently. Skipping to avoid duplicates.');
          return;
        }
        
        // Update last process time
        PropertiesService.getScriptProperties().setProperty('lastProcessTime', currentTime.toString());
      }
    }
    
    // Get respondent email
    const respondentEmail = formResponse.getRespondentEmail();
    console.log('Respondent email:', respondentEmail);
    
    // Additional duplicate protection: check if we already sent certificate to this email recently
    const emailKey = `cert_sent_${respondentEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const lastSentTime = PropertiesService.getScriptProperties().getProperty(emailKey);
    const currentTime = new Date().getTime();
    
    if (lastSentTime && (currentTime - parseInt(lastSentTime)) < 300000) { // 5 minutes
      console.log(`Certificate already sent to ${respondentEmail} in the last 5 minutes. Skipping.`);
      return;
    }
    
    // Get all item responses to find the name
    const itemResponses = formResponse.getItemResponses();
    
    // Extract student name
    let studentName = 'Student';
    for (let itemResponse of itemResponses) {
      const item = itemResponse.getItem();
      const title = item.getTitle().toLowerCase();
      
      if (title.includes('name') || title.includes('full name') || 
          title.includes('your name') || title.includes('student name')) {
        const nameResponse = itemResponse.getResponse();
        if (nameResponse && nameResponse.toString().trim() !== '') {
          studentName = nameResponse.toString().trim();
          console.log('Found name:', studentName);
          break;
        }
      }
    }
    
    // If no name found, use email
    if (studentName === 'Student' && respondentEmail) {
      studentName = respondentEmail.split('@')[0].replace(/[._]/g, ' ');
      console.log('Using name from email:', studentName);
    }
    
    // Get gradable responses (the key insight!)
    const gradableResponses = formResponse.getGradableItemResponses();
    console.log(`Found ${gradableResponses.length} gradable questions`);
    
    let totalEarned = 0;
    let totalPossible = 0;
    
    // Calculate scores using the correct method
    gradableResponses.forEach((gradableResponse, index) => {
      const item = gradableResponse.getItem();
      const score = gradableResponse.getScore();
      const response = gradableResponse.getResponse();
      const questionTitle = item.getTitle();
      
      // Skip name fields even if they appear as gradable
      if (questionTitle.toLowerCase().includes('name')) {
        console.log(`Skipping name field: "${questionTitle}"`);
        return;
      }
      
      // Get max points from the form item
      let maxPoints = 0;
      const itemType = item.getType();
      
      try {
        if (itemType === FormApp.ItemType.MULTIPLE_CHOICE) {
          maxPoints = item.asMultipleChoiceItem().getPoints();
        } else if (itemType === FormApp.ItemType.CHECKBOX) {
          maxPoints = item.asCheckboxItem().getPoints();
        } else if (itemType === FormApp.ItemType.TEXT) {
          maxPoints = item.asTextItem().getPoints();
        } else if (itemType === FormApp.ItemType.PARAGRAPH_TEXT) {
          maxPoints = item.asParagraphTextItem().getPoints();
        }
      } catch (e) {
        console.log(`Could not get max points for question "${questionTitle}": ${e.message}`);
        // If we can't get max points, assume the score is the max if they got it right
        maxPoints = score > 0 ? score : 1; // Fallback assumption
      }
      
      console.log(`Question: "${questionTitle}"`);
      console.log(`  Response: "${response}"`);
      console.log(`  Score: ${score}/${maxPoints} points`);
      
      totalEarned += score;
      totalPossible += maxPoints;
    });
    
    console.log(`Final Score: ${totalEarned}/${totalPossible} points`);
    
    // Calculate percentage
    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    console.log(`Percentage: ${percentage}%`);
    
    // Check if passed (80% or higher)
    if (percentage >= 80) {
      // Record that we're sending a certificate
      PropertiesService.getScriptProperties().setProperty(emailKey, currentTime.toString());
      
      sendCertificate(respondentEmail, studentName, percentage, totalEarned, totalPossible);
    } else {
      sendFailureNotification(respondentEmail, studentName, percentage);
    }
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    console.log('Full error details:', error.toString());
  }
}

function sendCertificate(email, name, percentage, earnedPoints, totalPoints) {
  try {
    console.log(`Sending certificate to ${name} (${email}) - Score: ${percentage}%`);
    
    // Create certificate with your YouthMappers template (4:3 ratio)
    const certificateBlob = createYouthMappersCertificate(name, percentage, earnedPoints, totalPoints);
    
    // Email subject and body
    const subject = 'Congratulations! Your YouthMappers Certificate';
    const body = `Dear ${name},\n\nCongratulations! You have successfully completed the OpenStreetMap Ecosystem training with a score of ${percentage}% (${earnedPoints}/${totalPoints} points).\n\nPlease find your certificate of completion attached.\n\nBest regards,\nYouthMappers Academy Team`;
    
    // Send email with certificate attachment
    GmailApp.sendEmail(
      email,
      subject,
      body,
      {
        attachments: [certificateBlob],
        name: 'YouthMappers Academy'
      }
    );
    
    console.log(`Certificate sent successfully to ${email}`);
    
  } catch (error) {
    console.error('Error sending certificate:', error);
  }
}

function sendFailureNotification(email, name, percentage) {
  const subject = 'Quiz Results - Please Retake';
  const body = `Dear ${name},\n\nThank you for taking the OpenStreetMap Ecosystem quiz. Unfortunately, you scored ${percentage}%, which is below the required 80% passing grade.\n\nPlease review the material and retake the quiz when you're ready.\n\nBest regards,\nYouthMappers Academy Team`;
  
  GmailApp.sendEmail(email, subject, body, {name: 'YouthMappers Academy'});
}

function createYouthMappersCertificate(name, percentage, earnedPoints, totalPoints) {
  try {
    console.log('Creating YouthMappers certificate for:', name);
    
    // Your YouthMappers certificate template (4:3 ratio)
    const templateFileId = '199GtrUU0UA8Iv1_FNZ2CbtjCzx4wfYm8';
    
    // Create a new Google Slides presentation
    const presentation = SlidesApp.create(`YouthMappers_Certificate_${name}`);
    const slides = presentation.getSlides();
    const slide = slides[0];
    
    // Get the certificate template file
    const templateFile = DriveApp.getFileById(templateFileId);
    const imageBlob = templateFile.getBlob();
    
    console.log('Template file found:', templateFile.getName());
    
    // Remove default elements from slide
    const elements = slide.getPageElements();
    elements.forEach(element => {
      element.remove();
    });
    
    // Insert the background certificate image
    const insertedImage = slide.insertImage(imageBlob);
    
    // Set dimensions for perfect 4:3 ratio (no cropping)
    // Standard Google Slides dimensions are 720x540 (4:3 ratio)
    const slideWidth = 720;
    const slideHeight = 540;
    
    // insertedImage.setWidth(slideWidth).setHeight(slideHeight);
    insertedImage.setLeft(0).setTop(0);
    
    console.log('Certificate background image inserted at 4:3 ratio:', slideWidth, 'x', slideHeight);
    
    // Add the date text box (positioned for 4:3 certificate layout)
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    const dateBox = slide.insertTextBox(currentDate);
    // Positioned for typical certificate "Date" line at bottom left
    dateBox.setLeft(80);    // Left side positioning
    dateBox.setTop(430);    // Near bottom for date line
    dateBox.setWidth(200);  // Wide enough for full date
    dateBox.setHeight(35);  // Sufficient height for text
    
    // Style the date text
    const dateTextRange = dateBox.getText();
    dateTextRange.getTextStyle()
      .setFontSize(16)       // Good size for readability
      .setFontFamily('Arial')
      .setBold(true)
      .setForegroundColor('#000000'); // Black text
    
    // Center align the date text within its box
    dateTextRange.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    
    console.log('Date added:', currentDate);
    
    // Add the recipient name text box (positioned for "Recipient" line)
    const nameBox = slide.insertTextBox(name);
    nameBox.setLeft(420);   // Right side positioning for recipient line
    nameBox.setTop(430);    // Same vertical position as date
    nameBox.setWidth(250);  // Wide enough for longer names
    nameBox.setHeight(35);  // Same height as date box
    
    // Style the name text
    const nameTextRange = nameBox.getText();
    nameTextRange.getTextStyle()
      .setFontSize(16)       // Same size as date
      .setFontFamily('Arial')
      .setBold(true)
      .setForegroundColor('#000000'); // Black text
    
    // Center align the name text within its box
    nameTextRange.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    
    console.log('Name added:', name);
    
    // Save the presentation
    presentation.saveAndClose();
    
    // Wait for the presentation to be saved
    Utilities.sleep(2000);
    
    // Convert to PDF with proper 4:3 aspect ratio
    const presentationId = presentation.getId();
    const pdfBlob = DriveApp.getFileById(presentationId).getAs('application/pdf');
    pdfBlob.setName(`YouthMappers_Certificate_${name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
    
    console.log('4:3 Certificate converted to PDF successfully');
    
    // Clean up - delete the temporary presentation
    DriveApp.getFileById(presentationId).setTrashed(true);
    
    return pdfBlob;
    
  } catch (error) {
    console.error('Error creating YouthMappers certificate:', error);
    
    // Fallback: Create a simple text certificate if image method fails
    return createFallbackCertificate(name, percentage, earnedPoints, totalPoints);
  }
}

// // Fallback certificate creation if the image method fails
// function createFallbackCertificate(name, percentage, earnedPoints, totalPoints) {
//   try {
//     console.log('Creating fallback text certificate for:', name);
    
//     const doc = DocumentApp.create(`YouthMappers_Certificate_${name}_Fallback`);
//     const body = doc.getBody();
//     body.clear();
    
//     // Add certificate content with YouthMappers branding
//     body.appendParagraph('YOUTHMAPPERS ACADEMY')
//       .setHeading(DocumentApp.ParagraphHeading.TITLE)
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
//     body.appendParagraph('CERTIFICATE OF COMPLETION')
//       .setHeading(DocumentApp.ParagraphHeading.SUBTITLE)
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
//     body.appendParagraph('\n');
    
//     body.appendParagraph('OSM ECOSYSTEM')
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
//       .editAsText().setBold(true).setFontSize(18);
    
//     body.appendParagraph('YOUTHMAPPERS ACADEMY - BADGE 1')
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
//       .editAsText().setBold(true).setFontSize(14);
    
//     body.appendParagraph('\n');
    
//     body.appendParagraph('THIS CERTIFIES SUCCESSFUL COMPLETION OF YOUTHMAPPERS')
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
//     body.appendParagraph('OPENSTREETMAP TRAINING CHAPTER 1 - OPENSTREETMAP ECOSYSTEM')
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
//       .editAsText().setItalic(true);
    
//     body.appendParagraph('\n\n');
    
//     // Date and name section
//     const table = body.appendTable();
//     const row = table.appendTableRow();
    
//     const dateCell = row.appendTableCell(`Date\n\n${new Date().toLocaleDateString()}`);
//     dateCell.setWidth(250);
    
//     const nameCell = row.appendTableCell(`Recipient\n\n${name}`);
//     nameCell.setWidth(250);
    
//     table.setBorderWidth(0);
    
//     body.appendParagraph('\n');
//     body.appendParagraph(`Score: ${percentage}% (${earnedPoints}/${totalPoints} points)`)
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
//       .editAsText().setBold(true);
    
//     body.appendParagraph('\nyouthmappers')
//       .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
//       .editAsText().setItalic(true);
    
//     doc.saveAndClose();
    
//     const pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf');
//     pdfBlob.setName(`YouthMappers_Certificate_${name.replace(/\s+/g, '_')}_Fallback.pdf`);
    
//     DriveApp.getFileById(doc.getId()).setTrashed(true);
    
//     console.log('Fallback certificate created successfully');
//     return pdfBlob;
    
//   } catch (error) {
//     console.error('Error creating fallback certificate:', error);
//     throw error;
//   }
// }
  
 

// Test function to check the latest response manually
function testLatestResponse() {
  console.log('Testing with the latest form response...');
  onFormSubmit(); // This will process the most recent submission
}

// Test function to create a sample certificate
function testCertificateCreation() {
  try {
    console.log('Testing 4:3 certificate creation...');
    
    const sampleName = 'John Doe';
    const samplePercentage = 95;
    const sampleEarned = 19;
    const sampleTotal = 20;
    
    const certificateBlob = createYouthMappersCertificate(sampleName, samplePercentage, sampleEarned, sampleTotal);
    
    console.log('4:3 Certificate created successfully!');
    console.log('Certificate name:', certificateBlob.getName());
    console.log('Certificate size:', certificateBlob.getBytes().length, 'bytes');
    
    // Optionally email the test certificate to yourself
    const testEmail = Session.getActiveUser().getEmail();
    GmailApp.sendEmail(
      testEmail,
      'Test YouthMappers 4:3 Certificate',
      'Here is a test certificate generated with the new 4:3 ratio template.',
      {
        attachments: [certificateBlob],
        name: 'YouthMappers Academy'
      }
    );
    
    console.log('Test certificate emailed to:', testEmail);
    
  } catch (error) {
    console.error('Error testing certificate creation:', error);
  }
}

// Test email functionality
function testEmailSetup() {
  const testEmail = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(
    testEmail,
    'Test Email from YouthMappers Quiz Script',
    'If you receive this email, the script setup is working correctly!'
  );
  console.log('Test email sent to:', testEmail);
}

// Helper function to inspect your form structure
function inspectForm() {
  try {
    const form = FormApp.openById('1luEms8em1u4P-AfHNFUeqsq_CYfds_UJZPFLGy6XL7A');
    console.log('=== FORM INSPECTION ===');
    console.log('Form Title:', form.getTitle());
    console.log('Is Quiz:', form.isQuiz());
    console.log('Collect Email:', form.collectsEmail());
    
    const items = form.getItems();
    console.log('\n=== FORM QUESTIONS ===');
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. "${item.getTitle()}"`);
      console.log(`   Type: ${item.getType()}`);
      
      // Try to get quiz info
      try {
        const quizItem = item.asQuizItem();
        const points = quizItem.getPoints();
        console.log(`   ✓ QUIZ ITEM: ${points} points`);
        
      } catch (e) {
        console.log(`   ✗ NOT a quiz item: ${e.message}`);
        
        // Check what type it is specifically
        if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
          console.log(`   (This is a multiple choice item without quiz scoring)`);
        } else if (item.getType() === FormApp.ItemType.CHECKBOX) {
          console.log(`   (This is a checkbox item without quiz scoring)`);
        } else if (item.getType() === FormApp.ItemType.TEXT) {
          console.log(`   (This is a text item - probably the name field)`);
        }
      }
    });
    
    const responses = form.getResponses();
    console.log(`\n=== RESPONSES (${responses.length} total) ===`);
    
  } catch (error) {
    console.error('Error inspecting form:', error);
  }
}


testCertificateCreation()
