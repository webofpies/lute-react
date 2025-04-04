"""
Acceptance test fixtures and step definitions.

Fixtures used in most or all tests:
_environment_check: ensures site is up
chromebrowser: creates a properly configured browser
luteclient: WIPES THE DB and provides helpful wrappers
"""

import os
import re
import tempfile
import time
import yaml
import requests

import pytest
from pytest_bdd import given, when, then, parsers
from selenium.webdriver.chrome.options import Options as ChromeOptions
from splinter import Browser
from tests.acceptance.lute_test_client import LuteTestClient


def pytest_addoption(parser):
    """
    Command-line args for pytest runs.
    """
    parser.addoption("--port", action="store", type=int, help="Specify the port number")
    parser.addoption("--headless", action="store_true", help="Run the test as headless")
    parser.addoption("--mobile", action="store_true", help="Run tests tagged @mobile")


@pytest.fixture(name="_environment_check", scope="session")
def fixture_env_check(request):
    """
    Sanity check that the site is up, port is set.
    """
    useport = request.config.getoption("--port")
    if useport is None:
        # Need to specify the port, e.g.
        # pytest tests/acceptance --port=1234
        # Acceptance tests run using 'inv accept' sort this out automatically.
        pytest.exit("--port not set")

    # Try connecting a few times.
    success = False
    max_attempts = 5
    curr_attempt = 0
    url = f"http://localhost:{useport}/"

    while curr_attempt < max_attempts and not success:
        curr_attempt += 1
        try:
            requests.get(url, timeout=10)
            success = True
        except requests.exceptions.ConnectionError:
            time.sleep(5)

    if not success:
        msg = f"Unable to reach {url} after {curr_attempt} tries ... "
        msg += "is it running?  Use inv accept to auto-start it."
        pytest.exit(msg)
        print()
    else:
        print(f"Connected successfully after {curr_attempt} tries")


@pytest.fixture(name="chromebrowser", scope="session")
def session_chrome_browser(request, _environment_check):
    """
    Create a chrome browser.

    For some weird reason, this performs **MUCH**
    better than the default "browser" fixture provided by
    splinter/pytest-splinter:

    "with self.browser.get_iframe('wordframe') as iframe"
      - Without this custom fixture: 5+ seconds!
      - With this fixture: 0.03 seconds

    The times were consistent with various options: headless,
    non, virus scanning on/off, etc.
    """
    chrome_options = ChromeOptions()

    headless = request.config.getoption("--headless")
    if headless:
        chrome_options.add_argument("--headless")  # Enable headless mode

        # Set the window size and ensure no devtools, or errors happen:
        #
        # selenium.common.exceptions.ElementClickInterceptedException:
        # Message: element click intercepted: Element <button id="submit" ... >
        #   is not clickable at poi...
        #
        # Possibly running headless is opening devtools or using
        # a smaller browser window, which affects the layout and
        # hides some elements.  When run in non-headless, all is fine.

        # https://stackoverflow.com/questions/54023497/
        #   python-selenium-chrome-driver-disable-devtools
        chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

        # https://stackoverflow.com/questions/43541925/
        #   how-can-i-set-the-browser-window-size-when-using-google-chrome-headless
        chrome_options.add_argument("window-size=1920,1080")

    mobile = request.config.getoption("--mobile")
    if mobile:
        useragent = [
            "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D)",
            "AppleWebKit/535.19 (KHTML, like Gecko)",
            "Chrome/18.0.1025.166 Mobile Safari/535.19",
        ]
        mobile_emulation = {
            "deviceMetrics": {"width": 375, "height": 812, "pixelRatio": 3.0},
            "userAgent": " ".join(useragent),
        }
        chrome_options.add_experimental_option("mobileEmulation", mobile_emulation)

    chrome_options.add_argument("--disable-blink-features=AutomationControlled")

    # Initialize the browser with ChromeOptions
    browser = Browser("chrome", options=chrome_options)

    # Set up and clean up the browser
    def fin():
        browser.quit()

    request.addfinalizer(fin)

    return browser


@pytest.fixture(name="luteclient")
def fixture_lute_client(request, chromebrowser):
    """
    Start the lute browser.
    """
    useport = request.config.getoption("--port")
    url = f"http://localhost:{useport}"
    c = LuteTestClient(chromebrowser, url)
    yield c


@pytest.fixture(name="_restore_jp_parser")
def fixture_restore_jp_parser(luteclient):
    "Hack for test: restore a parser using the dev api."
    yield
    luteclient.change_parser_registry_key("disabled_japanese", "japanese")


################################
## STEP DEFS


@given("terminate the test")
def terminate_test():
    raise RuntimeError("Test terminated intentionally :wave:")


# Setup


@when(parsers.parse("sleep for {seconds}"))
def _sleep(seconds):
    "Hack helper."
    time.sleep(int(seconds))


@given("a running site")
def given_running_site(luteclient):
    "Sanity check!"
    resp = requests.get(luteclient.home, timeout=5)
    assert resp.status_code == 200, f"{luteclient.home} is up"
    luteclient.visit("/")
    luteclient.clear_book_filter()
    assert luteclient.browser.is_text_present("Lute")


@given('I disable the "japanese" parser')
def disable_japanese_parser(luteclient, _restore_jp_parser):
    luteclient.change_parser_registry_key("japanese", "disabled_japanese")


@given('I enable the "japanese" parser')
def enable_jp_parser(luteclient):
    luteclient.change_parser_registry_key("disabled_japanese", "japanese")


@given("all page start dates are set to null")
def set_txstartdate_to_null(luteclient):
    "Hack data."
    luteclient.set_txstartdate_to_null()


# Browsing


@given(parsers.parse('I visit "{p}"'))
def given_visit(luteclient, p):
    "Go to a page."
    luteclient.visit(p)


@when(parsers.parse('I click the "{linktext}" link'))
def when_click_link_text(luteclient, linktext):
    luteclient.browser.links.find_by_text(linktext).click()


@then(parsers.parse("the page title is {title}"))
def then_title(luteclient, title):
    assert luteclient.browser.title == title


@then(parsers.parse('the page contains "{text}"'))
def then_page_contains(luteclient, text):
    assert text in luteclient.browser.html


# Language


@given("demo languages")
def given_demo_langs_loaded(luteclient):
    "Spot check some things exist."
    for s in ["English", "Spanish"]:
        assert s in luteclient.language_ids, f"Check map for {s}"


@given("the demo stories are loaded")
def given_demo_stories_loaded(luteclient):
    "Load the demo stories."
    luteclient.load_demo_stories()
    _sleep(1)  # Hack!
    luteclient.visit("/")
    _sleep(1)  # Hack!
    luteclient.clear_book_filter()
    _sleep(0.5)  # Hack!


@given("I clear the book filter")
def given_clear_book_filter(luteclient):
    "clear filter."
    luteclient.visit("/")
    luteclient.clear_book_filter()


@given(parsers.parse("I update the {lang} language:\n{content}"))
def given_update_language(luteclient, lang, content):
    "Content is assumed to be yaml."
    updates = yaml.safe_load(content)
    luteclient.edit_language(lang, updates)


# Books


@given(parsers.parse('a {lang} book "{title}" with content:\n{c}'))
def given_book(luteclient, lang, title, c):
    "Make a book."
    luteclient.make_book(title, c, lang)
    _sleep(1)  # Hack!


@given(parsers.parse('a {lang} book "{title}" from file {filename}'))
def given_book_from_file(luteclient, lang, title, filename):
    "Book is made from file in sample_files dir."
    thisdir = os.path.dirname(os.path.realpath(__file__))
    fullpath = os.path.join(thisdir, "sample_files", filename)
    luteclient.make_book_from_file(title, fullpath, lang)
    _sleep(1)  # Hack!


@given(parsers.parse("a {lang} book from url {url}"))
def given_book_from_url(luteclient, lang, url):
    "Book is made from url in dev_api."
    luteclient.make_book_from_url(url, lang)
    _sleep(1)  # Hack!


@given(parsers.parse('the book table loads "{title}"'))
def given_book_table_wait(luteclient, title):
    "The book table is loaded via ajax, so there's a delay."
    _sleep(1)  # Hack!
    assert title in luteclient.browser.html


@when(parsers.parse('I set the book table filter to "{filt}"'))
def when_set_book_table_filter(luteclient, filt):
    "Set the filter, wait a sec."
    b = luteclient.browser
    b.find_by_tag("input").fill(filt)
    time.sleep(1)


@then(parsers.parse("the book table contains:\n{content}"))
def check_book_table(luteclient, content):
    "Check the table, e.g. content like 'Hola; Spanish; ; 4 (0%);'"
    time.sleep(1)
    assert content == luteclient.get_book_table_content()


@then(parsers.parse("book pages with start dates are:\n{content}"))
def book_page_start_dates_are(luteclient, content):
    assert content == luteclient.get_book_page_start_dates()


@then(parsers.parse("book pages with read dates are:\n{content}"))
def book_page_read_dates_are(luteclient, content):
    assert content == luteclient.get_book_page_read_dates()


# Terms


@given(parsers.parse("a new {lang} term:\n{content}"))
def given_new_term(luteclient, lang, content):
    "The content is assumed to be yaml."
    updates = yaml.safe_load(content)
    luteclient.make_term(lang, updates)


@given(parsers.parse("import term file:\n{content}"))
def import_term_file(luteclient, content):
    "Import the term file."
    luteclient.visit("/")
    luteclient.browser.find_by_css("#menu_terms").mouse_over()
    luteclient.browser.find_by_id("term_import_index").first.click()
    fd, path = tempfile.mkstemp()
    with os.fdopen(fd, "w") as tmp:
        # do stuff with temp file
        tmp.write(content)
    luteclient.browser.attach_file("text_file", path)
    luteclient.browser.find_by_id("create_terms").click()
    luteclient.browser.find_by_id("update_terms").click()
    luteclient.browser.find_by_id("btnSubmit").click()


@then(parsers.parse("the term table contains:\n{content}"))
def check_term_table(luteclient, content):
    "Check the table."
    luteclient.visit("/")
    luteclient.browser.find_by_css("#menu_terms").mouse_over()
    luteclient.browser.find_by_id("term_index").first.click()
    time.sleep(1)
    if content == "-":
        content = "No data available in table"
    assert content == luteclient.get_term_table_content()


@when("click Export CSV")
def click_export_csv(luteclient):
    "Export the term csv"
    luteclient.browser.find_by_css("#term_actions").mouse_over()
    luteclient.click_link("Export CSV")


@then(parsers.parse("exported CSV file contains:\n{content}"))
def check_exported_file(luteclient, content):
    "Check the exported file, replace all dates with placeholder."
    actual = luteclient.get_temp_file_content("export_terms.csv").strip()
    actual = re.sub(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}", "DATE_HERE", actual)
    assert content == actual


# Reading


@then(parsers.parse("the reading pane shows:\n{content}"))
def then_read_content(luteclient, content):
    "Check rendered content."
    c = content.replace("\n", "/")
    timeout = 3  # seconds
    poll_frequency = 0.25
    start_time = time.time()
    displayed = luteclient.displayed_text()
    while time.time() - start_time < timeout:
        if c == displayed:
            break
        time.sleep(poll_frequency)
    else:
        assert c == displayed


@when(parsers.parse("I change the current text content to:\n{content}"))
def when_change_content(luteclient, content):
    "Change the content."
    assert "Reading" in luteclient.browser.title, "sanity check"
    b = luteclient.browser
    b.find_by_css("div.hamburger-btn").first.click()
    b.find_by_id("page-operations-title").click()
    b.find_by_id("editText").click()
    b.find_by_id("text").fill(content)
    b.find_by_id("submit").click()


@when(parsers.parse("I add a page {position} current with content:\n{content}"))
def when_add_page(luteclient, position, content):
    "Change the content."
    assert "Reading" in luteclient.browser.title, "sanity check"
    b = luteclient.browser
    b.find_by_css("div.hamburger-btn").first.click()
    b.find_by_id("page-operations-title").click()

    assert position in ["before", "after"], "sanity check"
    linkid = "readmenu_add_page_before"
    if position == "after":
        linkid = "readmenu_add_page_after"
    b.find_by_id(linkid).click()
    b.find_by_id("text").fill(content)
    b.find_by_id("submit").click()
    b.reload()


@when(parsers.parse("I go to the {position} page"))
def when_go_to_page(luteclient, position):
    "Go to page."
    assert "Reading" in luteclient.browser.title, "sanity check"
    assert position in ["previous", "next"], "sanity check"

    linkid = "navNext"
    if position == "previous":
        linkid = "navPrev"
    b = luteclient.browser
    b.find_by_id(linkid).first.click()
    time.sleep(0.5)  # Assume this is necessary for ajax reload.
    # Don't reload, as it seems to nullify the nav click.
    # b.reload()


@given(parsers.parse("I peek at page {pagenum}"))
def given_peek_at_page(luteclient, pagenum):
    "Peek at a page of the current book."
    currurl = luteclient.browser.url
    peekurl = re.sub(r"/page/.*", f"/peek/{pagenum}", currurl)
    luteclient.browser.visit(peekurl)


@when(parsers.parse("I delete the current page"))
def when_delete_current_page(luteclient):
    "Delete the current page."
    assert "Reading" in luteclient.browser.title, "sanity check"
    b = luteclient.browser
    b.find_by_css("div.hamburger-btn").first.click()
    b.find_by_id("page-operations-title").click()
    b.find_by_id("readmenu_delete_page").first.click()
    alert = b.get_alert()
    alert.accept()
    b.reload()


# Reading, terms


@when(parsers.parse('I click "{word}" and edit the form:\n{content}'))
def when_click_word_edit_form(luteclient, word, content):
    "The content is assumed to be yaml."
    updates = yaml.safe_load(content)
    luteclient.click_word_fill_form(word, updates)


@when(parsers.parse("I edit the bulk edit form:\n{content}"))
def when_post_bulk_edits_while_reading(luteclient, content):
    "The content is assumed to be yaml."
    updates = yaml.safe_load(content)
    luteclient.fill_reading_bulk_edit_form(updates)


@then(parsers.parse('the reading page term form frame contains "{text}"'))
def then_reading_page_term_form_iframe_contains(luteclient, text):
    "Have to get and read the iframe content, it's not in the main browser page."
    with luteclient.browser.get_iframe("wordframe") as iframe:
        assert text in iframe.html


# Reading, word actions


@when(parsers.parse('I click "{word}"'))
def when_click_word(luteclient, word):
    "Click word."
    luteclient.click_word(word)


@then(parsers.parse('the reading page term form shows term "{text}"'))
def then_reading_page_term_form_iframe_shows_term(luteclient, text):
    "Have to get and read the iframe content, it's not in the main browser page."
    with luteclient.browser.get_iframe("wordframe") as iframe:
        time.sleep(0.4)  # Hack, test failing.
        term_field = iframe.find_by_css("#text").first
        zws = "\u200B"
        val = term_field.value.replace(zws, "")
        assert val == text, "check field value"


@then("the bulk edit term form is shown")
def then_reading_page_bulk_edit_term_form_is_shown(luteclient):
    "Check content."
    then_reading_page_term_form_iframe_contains(luteclient, "Updating")


@then("the term form is hidden")
def then_reading_page_term_form_is_hidden(luteclient):
    "Set to blankn"
    iframe_element = luteclient.browser.find_by_id("wordframeid").first
    iframe_src = iframe_element["src"]
    blanks = ["about:blank", "http://localhost:5001/read/empty"]
    assert iframe_src in blanks, "Is blank"


@when(parsers.parse("I shift click:\n{words}"))
def shift_click_terms(luteclient, words):
    "Shift-click"
    words = words.split("\n")
    luteclient.shift_click_words(words)


@when(parsers.parse('I shift-drag from "{wstart}" to "{wend}"'))
def shift_drag(luteclient, wstart, wend):
    "shift-drag highlights multiple words, copies to clipboard."
    luteclient.shift_drag(wstart, wend)


@when(parsers.parse('I drag from "{wstart}" to "{wend}"'))
def drag(luteclient, wstart, wend):
    "shift-drag highlights multiple words, copies to clipboard."
    luteclient.drag(wstart, wend)


@when(parsers.parse('I click "{word}" and press hotkey "{hotkey}"'))
def when_click_word_press_hotkey(luteclient, word, hotkey):
    "Click word and press hotkey."
    luteclient.click_word(word)
    luteclient.press_hotkey(hotkey)


@when(parsers.parse('I hover over "{word}"'))
def when_hover(luteclient, word):
    "Hover over a term."
    els = luteclient.browser.find_by_text(word)
    assert len(els) == 1, f'have single "{word}"'
    els[0].mouse_over()


@when(parsers.parse('I press hotkey "{hotkey}"'))
def when_press_hotkey(luteclient, hotkey):
    "Press hotkey."
    luteclient.press_hotkey(hotkey)


@given(parsers.parse('I set hotkey "{hotkey}" to "{value}"'))
def given_set_hotkey(luteclient, hotkey, value):
    "Set a hotkey to be X."
    luteclient.hack_set_hotkey(hotkey, value)


# Reading, paging


@when(parsers.parse("I click the footer green check"))
def when_click_footer_check(luteclient):
    "Click footer."
    luteclient.browser.find_by_id("footerMarkRestAsKnownNextPage").click()
    time.sleep(0.1)  # Leave this, remove and test fails.


@when(parsers.parse("I click the footer next page"))
def when_click_footer_next_page(luteclient):
    "Click footer."
    luteclient.browser.find_by_id("footerNextPage").click()
    time.sleep(0.1)  # Leave this, remove and test fails.
