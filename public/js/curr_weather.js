/**
 * @file Scripting for corresponding HTML file
 * @author Omar Taylor <omtaylor@iastate.edu>
 */

// Run scripts when document finished loadin
$(document).ready(() => {

    // Parse form on submission
    $('form').on('submit', event => {
        event.preventDefault(); // Prevent default action of form submission

        // Grab values from form (code redundancy reduction)
        const city = $('#city').val(),
            country = $('#country').val();

        // Implement client-side error checks for better user experience (check again server-side to defend against
        // naughty users).
        if (!(city || country)) // Both fields blank?
            return Materialize.toast('Please enter a city and coutnry name.', 3000, 'teal');
        else if (!city) // City blank?
            return Materialize.toast('Please enter a city name.', 3000, 'teal');
        else if (!country) // Country blank?
            return Materialize.toast('Please enter a country name.', 3000, 'teal');

        // Build AJAX query
        $.get('/weather?city=' + city + '&country=' + country, res => {

            // Report errors from server
            if (res.err)
                return Materialize.toast(res.err, 3000, 'teal');

            // Report weather if everything checks out
            $('.weather-res').html('<p class="weather-res">The current temperature in <b>' + res.info.city +
                '</b> is <b>' + res.info.fahrenheit + '&#8457; (' + res.info.celsius + ' &#8451;)</b></p>');
        });
    });
});