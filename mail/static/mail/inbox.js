document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('#compose-form').addEventListener('submit', async function (event) {
        event.preventDefault();  // Prevent the default form submission

        // Gather the data from the form
        const formData = {
            from: document.querySelector('input[name="from"]').value,  // 'from' is disabled but can be read
            to: document.querySelector('input[name="to"]').value,
            subject: document.querySelector('input[name="subject"]').value,
            body: document.querySelector('textarea[name="body"]').value
        };

        // Send the data as JSON using fetch
        await fetch("emails/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Set the correct content type
            },
            body: JSON.stringify(formData)  // Convert form data to JSON
        })
            .then(response => response.json())
            .catch(error => console.error('Error:', error));
        await load_mailbox('sent');

    });

    // By default, load the inbox
    load_mailbox('inbox')

});

function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector('#title').innerHTML = ''

}

async function mailId(id, event) {
    let send
    if (event.textContent === 'Unarchived') {
        send = {
            read: null,
            archived: false,
        }
    } else {
        send = {
            read: event.getAttribute('id') === 'email-read-btn' ? true : null,
            archived: event.getAttribute('id') === 'email-archive-btn' ? true : null,
        }
    }
    await fetch(`emails/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(send),
    })
    if (event.textContent === 'Archive') {
        await load_mailbox('archive')
    } else {
        await load_mailbox('inbox')
    }
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    const emails_view = document.querySelector('#emails-view')
    emails_view.style.display = 'block'
    emails_view.innerHTML = ''
    document.querySelector('#compose-view').style.display = 'none';

    const urlTemplate = document.getElementById('email-endpoint').getAttribute('data-url-template');
    const url = urlTemplate.replace('PLACEHOLDER', mailbox)

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'applications/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                document.querySelector('#emails-view').style.display = 'none'
            }

            data.forEach(da => {

                const emailCardHTML = `
                <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Subject: <span id="email-subject">${da.subject}</span></h5>
                <small class="text-muted" id="email-timestamp">${da.timestamp}</small>
            </div>
            <div class="card-body">
                <h6 class="card-subtitle mb-2 text-muted">From: <span id="email-sender">${da.sender}</span></h6>
                <p class="card-text"><strong>To:</strong> <span id="email-recipients">${da.recipients}</span></p>
                <p class="card-text" id="email-body">${da.body}</p>
            </div>
            <div class="card-footer text-muted">
                <button class="btn btn-sm btn-primary" id="email-read-btn" onclick="mailId(${da.id}, this)">Mark as Read</button>
                <button class="btn btn-sm btn-secondary" id="email-archive-btn" onclick="mailId(${da.id}, this)">Archive</button>
                
        </button>
            </div>
        </div>
                `
                const email_view = document.querySelector('#emails-view')
                email_view.innerHTML += emailCardHTML
                if (mailbox === 'inbox' || mailbox === 'archive') {
                    const replyBtn = document.createElement('button')
                    const cardFooter = email_view.querySelector('.card-footer')
                    replyBtn.setAttribute('class', 'btn btn-sm btn-success')
                    replyBtn.setAttribute('id', 'email-reply-btn')
                    replyBtn.textContent = 'Reply'
                    cardFooter.appendChild(replyBtn)
                    replyBtn.addEventListener('click', () => {
                        compose_email()
                        document.querySelector('#compose-recipients').value = da.sender
                        document.querySelector('#compose-subject').value = `Re: ${da.subject}`
                        document.querySelector('#compose-body').value = `${da.timestamp} ${da.sender} wrote:`
                    })
                }
                const archivedBtn = document.querySelectorAll('#email-archive-btn')
                if (mailbox === 'sent') {
                    archivedBtn.forEach(e => {
                        e.style.display = 'none'
                    })
                } else if (mailbox === 'archive') {
                    archivedBtn.forEach(e => {
                        if (da.archived) {
                            e.setAttribute('class', 'btn btn-sm btn-danger')
                            e.textContent = 'Unarchived'
                        }
                    })
                }
            })
        })
    document.querySelector('#title').innerHTML = mailbox.charAt(0).toUpperCase() + mailbox.slice(1)

}