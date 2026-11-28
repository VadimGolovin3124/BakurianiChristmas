export const metadata = { title: 'Privacy · Mta Bakuriani' };
export default function Privacy() {
  return (
    <main className="profile-page">
      <header className="profile-header">
        <a href="/BakurianiChristmas/">← Mta · Bakuriani</a>
        <nav>
          <a href="#ru">RU</a> · <a href="#en">EN</a> · <a href="#ka">GE</a>
        </nav>
      </header>
      <article style={{ maxWidth: 780, margin: '3rem auto', lineHeight: 1.8 }}>
        <section id="ru" lang="ru">
          <h1>Конфиденциальность</h1>
          <p>Сообщения помощнику передаются в OpenAI для формирования ответа; при необходимости используется поиск в интернете. Не отправляйте в чат пароли, платёжные данные или другие чувствительные сведения. Переписка хранится в открытой вкладке до её перезагрузки и не сохраняется в профиле сайта.</p>
          <p>
            Сайт Mta Bakuriani помогает забронировать квартиру по адресу Raymond
            (Guram) Gogoladze Street 42, Бакуриани, Грузия. Контакт хозяйки:{' '}
            <a href="tel:+972547927001">+972 54-792-7001</a>.
          </p>
          <p>
            При входе через Google сайт получает ваше имя, email и идентификатор
            аккаунта. Пароль Google, письма и файлы сайту недоступны. Вы
            самостоятельно указываете телефон, даты поездки, число гостей и
            пожелания. Эти сведения нужны для профиля, обработки заявки и связи
            с вами.
          </p>
          <p>
            Брони хранятся на сервере. Их видите вы и управляющие квартирой.
            Публичный календарь показывает только занятые даты. При подключённых
            уведомлениях имя, email, телефон и сведения о брони передаются через
            Telegram двум назначенным управляющим. Переписка по кнопке WhatsApp
            происходит в WhatsApp, по правилам Meta.
          </p>
          <p>
            Для работы используются Firebase / Google (вход и размещение) и Cloudflare
            (база данных), а при подключении уведомлений — Telegram. Сайт
            использует необходимое локальное хранилище для входа и сохраняет на вашем
            устройстве язык и черновик выбора дат. Состояние входа сохраняется на устройстве;
            выйти можно в профиле. Данные не используются сайтом для рекламных
            рассылок.
          </p>
          <p>
            История бронирований сохраняется после отмены. Для исправления или
            удаления профиля и связанных данных обратитесь к хозяйке по
            указанному номеру. Доступ Google можно отозвать в настройках своего
            Google-аккаунта; это само по себе не удаляет сохранённые брони.
          </p>
        </section>
        <section id="en" lang="en">
          <h2>Privacy</h2>
          <p>Messages to the assistant are sent to OpenAI to generate replies, and web search may be used. Please do not send passwords, payment details or other sensitive information. The conversation stays in the open tab until it is reloaded and is not stored in your site profile.</p>
          <p>
            Mta Bakuriani handles apartment bookings at Raymond (Guram)
            Gogoladze Street 42, Bakuriani, Georgia. Host contact:{' '}
            <a href="tel:+972547927001">+972 54-792-7001</a>.
          </p>
          <p>
            Google sign-in provides your name, email and account identifier. The
            site cannot access your Google password, mail or files. You provide
            your phone, travel dates, guest count and requests to manage your
            profile, booking and contact with the host.
          </p>
          <p>
            Bookings are stored on the server and visible to you and apartment
            managers. The public calendar shows occupied dates only. When
            notifications are connected, your name, email, phone and booking details
            are sent via Telegram to two designated managers. The WhatsApp
            contact button opens a conversation in WhatsApp, subject to Meta’s
            policies.
          </p>
          <p>
            The service uses Firebase / Google for sign-in and hosting, Cloudflare for
            storage, and Telegram when notifications are connected.
            Essential sign-in local storage and local language and date-draft
            preferences are used. Sign-in state is stored on your device; you can sign out
            in your profile. The site does not use your data for advertising
            messages.
          </p>
          <p>
            Booking history remains after cancellation. Contact the host to
            correct or delete your profile and related data. You can revoke
            Google access in your Google account settings; this does not itself
            delete stored bookings.
          </p>
        </section>
        <section id="ka" lang="ka">
          <h2>კონფიდენციალურობა</h2>
          <p>ასისტენტისთვის გაგზავნილი შეტყობინებები პასუხის მისაღებად გადაეცემა OpenAI-ს; საჭიროების შემთხვევაში გამოიყენება ვებ ძიება. გთხოვთ, ჩატში არ გაგზავნოთ პაროლები, გადახდის მონაცემები ან სხვა მგრძნობიარე ინფორმაცია. მიმოწერა ინახება ღია ჩანართში მის განახლებამდე და არ ინახება საიტის პროფილში.</p>
          <p>
            Mta Bakuriani იღებს ბინის დაჯავშნის მოთხოვნებს მისამართზე: Raymond
            (Guram) Gogoladze Street 42, ბაკურიანი, საქართველო. მასპინძელი:{' '}
            <a href="tel:+972547927001">+972 54-792-7001</a>.
          </p>
          <p>
            Google-ით შესვლისას ვიღებთ თქვენს სახელს, ელფოსტას და ანგარიშის
            იდენტიფიკატორს. საიტს არ აქვს წვდომა თქვენს Google პაროლზე,
            წერილებსა და ფაილებზე. ტელეფონს, თარიღებს, სტუმრების რაოდენობას და
            სურვილებს თავად უთითებთ. ეს მონაცემები გამოიყენება პროფილის,
            ჯავშნისა და თქვენთან კავშირისათვის.
          </p>
          <p>
            ჯავშნები ინახება სერვერზე და ხელმისაწვდომია თქვენთვის და ბინის
            მმართველებისთვის. საჯარო კალენდარში ჩანს მხოლოდ დაკავებული თარიღები.
            შეტყობინებების ჩართვისას სახელი, ელფოსტა, ტელეფონი და ჯავშნის დეტალები
            Telegram-ით ეგზავნება ორ დანიშნულ მმართველს. WhatsApp-ის ღილაკი
            ხსნის მიმოწერას WhatsApp-ში, Meta-ს წესების შესაბამისად.
          </p>
          <p>
            შესვლისთვის გამოიყენება Google, განთავსებისა და შენახვისთვის — Firebase
            და Cloudflare, ხოლო შეტყობინებებისთვის — Telegram. გამოიყენება
            შესვლისთვის აუცილებელი ლოკალური საცავი; ენა და არჩეული თარიღების მონახაზი
            ინახება თქვენს მოწყობილობაზე. შესვლის მდგომარეობა ინახება მოწყობილობაზე;
            გასვლა შეგიძლიათ პროფილიდან. საიტი მონაცემებს სარეკლამო
            შეტყობინებებისთვის არ იყენებს.
          </p>
          <p>
            გაუქმების შემდეგ ჯავშნის ისტორია რჩება. პროფილისა და დაკავშირებული
            მონაცემების გასასწორებლად ან წასაშლელად დაუკავშირდით მასპინძელს.
            Google-ზე წვდომის გაუქმება შეგიძლიათ Google ანგარიშის
            პარამეტრებიდან; ეს თავისთავად შენახულ ჯავშნებს არ შლის.
          </p>
        </section>
      </article>
    </main>
  );
}
