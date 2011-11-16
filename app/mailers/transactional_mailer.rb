class TransactionalMailer < ActionMailer::Base
  default from: "no-reply@putaframeonit.com"

  def order_confirmation(photo)
    @photo = photo
    mail(:to => photo.email,
         :subject => "Order confirmation from Put a Frame On It - #{photo.id}")
  end
end
